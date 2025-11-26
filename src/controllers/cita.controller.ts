import type { Request, Response } from "express";
import Cita from "../models/citas";
import { Op } from "sequelize";
import { User } from "../models";
import { addMinutes, format, parseISO, startOfDay } from 'date-fns';

const generateTimeSlots = (start: string, end: string, duration: number, interval = 20): string[] => {
  const slots: string[] = [];
  let current = parseISO(`2000-01-01T${start}:00`);
  const endTime = parseISO(`2000-01-01T${end}:00`);

  while (current < endTime) {
    const potentialEnd = addMinutes(current, duration);

    if (potentialEnd <= endTime) {
      slots.push(format(current, 'HH:mm'));
    }

    current = addMinutes(current, interval);
  }

  return slots;
};


export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { date, serviceDuration, barberId } = req.query;

    if (!date || !serviceDuration) {
      return res.status(400).json({ message: "Faltan parámetros requeridos (date, serviceDuration)" });
    }

    const SHOP_OPEN = '09:00';
    const SHOP_CLOSE = '21:00';
    const durationMinutes = parseInt(serviceDuration as string, 10);

    // Utilizamos new Date() para parsear la fecha (ej: '2025-11-27')
    const targetDate = new Date(date as string);

    // 🔍 LOGGING DE ENTRADA
    console.log(`🔍 getAvailability Input: Date=${date}, Duration=${durationMinutes}, BarberId=${barberId}`);

    let targetBarberIds: string[] = [];
    if (barberId && barberId !== 'any') {
      targetBarberIds = [barberId as string];
    } else {
      // Si es 'any' o no se proporciona, busca todos los barberos activos
      const allBarbers = await User.findAll({ where: { rol: 'barbero', activo: true } });
      targetBarberIds = allBarbers.map(b => b.id);
    }

    if (targetBarberIds.length === 0) {
      return res.json({ availableSlots: [] });
    }

    const startOfDayDate = startOfDay(targetDate);
    const endOfDayDate = addMinutes(startOfDayDate, 24 * 60);

    // 🔍 LOGGING DE RANGO DE CONSULTA
    console.log(`DB Query Range: ${startOfDayDate.toISOString()} to ${endOfDayDate.toISOString()}`);
    console.log(`Target Barber IDs: ${targetBarberIds.join(', ')}`);


    const existingAppointments = await Cita.findAll({
      // FIX: Excluimos la columna "fechaFin" que no existe en la DB
      attributes: ['id', 'barberoId', 'fechaHora', 'duracionMinutos', 'estado'],
      where: {
        barberoId: { [Op.in]: targetBarberIds },
        estado: { [Op.in]: ['pendiente', 'confirmada'] },
        fechaHora: {
          [Op.between]: [startOfDayDate, endOfDayDate]
        }
      },
      order: [['fechaHora', 'ASC']]
    });

    const allPossibleSlots = generateTimeSlots(SHOP_OPEN, SHOP_CLOSE, durationMinutes);

    const appointmentsByBarber: { [key: string]: typeof existingAppointments } = {};
    targetBarberIds.forEach(id => appointmentsByBarber[id] = []);
    existingAppointments.forEach(cita => {
      if (cita.barberoId) appointmentsByBarber[cita.barberoId]?.push(cita);
    });

    const freeSlots: string[] = [];

    for (const slotTime of allPossibleSlots) {
      // Recrea el objeto Date completo para el slot
      const slotStart = parseISO(`${format(targetDate, 'yyyy-MM-dd')}T${slotTime}:00`);
      const slotEnd = addMinutes(slotStart, durationMinutes);

      let isAvailable = false;

      for (const barberId of targetBarberIds) {
        const barberAppointments = appointmentsByBarber[barberId];

        const isBarberFree = !barberAppointments.some(cita => {
          // Aseguramos que fechaHora sea un objeto Date
          const appointmentStart = new Date(cita.fechaHora as Date | string);

          // Usamos 30 como valor por defecto si duracionMinutos es null/undefined
          const duration = cita.duracionMinutos || 30;

          const appointmentEnd = addMinutes(appointmentStart, duration);

          // Conflicto: slot nuevo comienza antes de que termine la cita existente
          // O el slot nuevo termina después de que empieza la cita existente.
          return slotStart < appointmentEnd && slotEnd > appointmentStart;
        });

        if (isBarberFree) {
          isAvailable = true;
          break;
        }
      }

      if (isAvailable) {
        freeSlots.push(slotTime);
      }
    }

    return res.json({ availableSlots: freeSlots });

  } catch (error) {
    console.error("❌ ERROR getAvailability:", error);
    // 🔑 Ahora capturamos y logueamos el objeto de error completo para obtener detalles de Sequelize/DB
    console.error("❌ Full Error Object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return res.status(500).json({ message: "Error al calcular la disponibilidad", details: (error as Error).message });
  }
};

export const getCitas = async (_req: Request, res: Response) => {
  try {
    const citas = await Cita.findAll();
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener citas", details: error });
  }
};

export const getCitaById = async (req: Request, res: Response) => {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });
    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener cita", details: error });
  }
};

export const createCita = async (req: Request, res: Response) => {
  try {
    const {
      clienteId,
      barberoId,
      servicioId,
      fechaHora,
      precioFinal,
      duracionMinutos,
      nombreCliente,
      emailCliente,
      whatsappCliente,
      notas
    } = req.body;

    if (!barberoId || !servicioId || !fechaHora) {
      return res.status(400).json({
        message: "Faltan campos obligatorios: barberoId, servicioId, fechaHora"
      });
    }

    const startDate = new Date(fechaHora);
    const duration = duracionMinutos ?? 30;

    // 🔥 CALCULAR fechaFin
    const fechaFin = addMinutes(startDate, duration);

    // 🔥 AHORA SI GUARDAMOS fechaFin
    const nueva = await Cita.create({
      clienteId: clienteId || null,
      barberoId,
      servicioId,
      fechaHora: startDate,
      fechaFin,
      estado: "confirmada",
      precioFinal: precioFinal ?? 0,
      duracionMinutos: duration,
      nombreCliente,
      emailCliente,
      whatsappCliente,
      notas
    });

    return res.status(201).json(nueva);

  } catch (error: any) {
    console.error("❌ ERROR createCita:", error);

    const sequelizeErrors = error.errors?.map((e: any) => ({
      message: e.message,
      path: e.path,
      value: e.value
    }));

    return res.status(400).json({
      error: "Error al crear cita",
      details: error.message,
      sequelizeErrors: sequelizeErrors || undefined
    });
  }
};


export const updateCita = async (req: Request, res: Response) => {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });

    await cita.update(req.body);
    res.json(cita);
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar cita", details: error });
  }
};

export const deleteCita = async (req: Request, res: Response) => {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });

    await cita.destroy();
    res.json({ message: "Cita eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar cita", details: error });
  }
};