import type { Request, Response } from "express";
import Cita from "../models/citas";
import { User } from "../models/user";
import { Op } from "sequelize";
import Service from "../models/service";

import { addMinutes, parseISO, format } from "date-fns";

function getDaySchedule(dateStr: string) {
  // dateStr viene como "YYYY-MM-DD"
  const [year, month, dayNum] = dateStr.split("-").map(Number);

  // Crear fecha local (NO UTC)
  const date = new Date(year, month - 1, dayNum);
  const day = date.getDay(); // 0 = domingo

  if (day === 0) {
    return { start: "10:00", last: "18:30" }; // Domingo + festivos
  }

  if (day >= 1 && day <= 4) {
    return { start: "08:00", last: "19:30" }; // Lunes a jueves
  }

  if (day === 5 || day === 6) {
    return { start: "08:00", last: "20:30" }; // Viernes y sábado
  }

  return { start: "08:00", last: "19:30" };
}

const generateTimeSlots = (
  start: string,
  end: string,
  _duration: number, // ya no se usa
  interval = 15
): string[] => {
  const slots: string[] = [];

  let current = parseISO(`2000-01-01T${start}:00`);
  const endLimit = parseISO(`2000-01-01T${end}:00`);

  while (current <= endLimit) {
    slots.push(format(current, "HH:mm"));
    current = addMinutes(current, interval);
  }

  return slots;
};

const BLOQUEO_SERVICE_ID = "00000000-0000-0000-0000-000000000999";

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { date, serviceDuration } = req.query;
    let barberoId = req.query.barberoId;

    if (Array.isArray(barberoId)) barberoId = barberoId[0];
    if (!date || !serviceDuration || !barberoId) {
      return res.status(400).json({ message: "Faltan parámetros requeridos" });
    }

    const dateStr = String(date);
    const durationMinutes = parseInt(serviceDuration as string, 10);

    const startUTC = new Date(`${dateStr}T00:00:00-05:00`);
    const endUTC = new Date(`${dateStr}T23:59:59-05:00`);

    const citas = await Cita.findAll({
      where: {
        barberoId,
        fechaHora: { [Op.between]: [startUTC, endUTC] },
      },
    });

    const { start, last } = getDaySchedule(dateStr);

    const allSlots = generateTimeSlots(start, last, durationMinutes);

    const availableSlots: string[] = [];

    for (const slot of allSlots) {
      const slotStartUTC = new Date(`${dateStr}T${slot}:00-05:00`);
      const slotEndUTC = addMinutes(slotStartUTC, durationMinutes);

      const hasConflict = citas.some((cita) => {
        const start = new Date(cita.fechaHora);
        const end = cita.fechaFin ?? addMinutes(start, cita.duracionMinutos);

        return slotStartUTC < end && slotEndUTC > start;
      });

      if (!hasConflict) availableSlots.push(slot);
    }

    return res.json({ availableSlots });
  } catch (error) {
    console.error("❌ ERROR getAvailability:", error);
    return res.status(500).json({ error: "Error interno" });
  }
};

export const createCita = async (req: Request, res: Response) => {
  try {
    const {
      clienteId,
      barberoId,
      servicioId,
      fechaHora,
      fechaFin,
      precioFinal,
      duracionMinutos,
      nombreCliente,
      emailCliente,
      whatsappCliente,
      notas,
    } = req.body;

    if (!barberoId || !fechaHora || !fechaFin) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    const isBloqueo = servicioId === BLOQUEO_SERVICE_ID;

    const inicio = new Date(fechaHora);
    const fin = new Date(fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return res.status(400).json({
        message: "Fecha inválida",
        details: { fechaHora, fechaFin },
      });
    }

    let duration = duracionMinutos ?? 30;

    if (!isBloqueo) {
      const servicio = await Service.findByPk(servicioId);
      if (!servicio)
        return res.status(404).json({ message: "Servicio no encontrado" });

      duration = servicio.duracion;
    }

    const conflict = await Cita.findOne({
      where: {
        barberoId,
        fechaHora: { [Op.lt]: fin },
        fechaFin: { [Op.gt]: inicio },
        estado: { [Op.in]: ["pendiente", "confirmada", "bloqueo"] },
      },
    });

    if (conflict && !isBloqueo) {
      // EL ADMIN SIEMPRE PUEDE CREAR CITA A PESAR DE BLOQUEOS
      // pero solo si servicio ≠ BLOQUEO
      if (conflict.estado === "bloqueo") {
        // permitir
      } else {
        return res.status(409).json({
          message: "El barbero ya tiene un evento en ese horario.",
        });
      }
    }

    const nueva = await Cita.create({
      clienteId: isBloqueo ? null : clienteId,
      barberoId,
      servicioId: isBloqueo ? BLOQUEO_SERVICE_ID : servicioId,
      fechaHora: inicio,
      fechaFin: fin,
      duracionMinutos: duration,
      estado: isBloqueo ? "bloqueo" : "confirmada",
      precioFinal: isBloqueo ? 0 : precioFinal ?? 0,
      nombreCliente: isBloqueo ? null : nombreCliente,
      emailCliente: isBloqueo ? null : emailCliente,
      whatsappCliente: isBloqueo ? null : whatsappCliente,
      notas: notas ?? null,
    });

    return res.status(201).json(nueva);
  } catch (error: any) {
    console.error("❌ ERROR createCita:", error);
    return res.status(500).json({
      error: "Error al crear cita",
      details: error.message,
    });
  }
};


export const updateCita = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const {
      nombreCliente,
      emailCliente,
      whatsappCliente,
      precioFinal,
      notas,
      fechaHora,
      estado
    } = req.body;

    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    let nuevaFechaHoraUTC = cita.fechaHora;

    if (fechaHora) {
      /* ⬅ FIX TIMEZONE */
      const parsed = new Date(
        fechaHora.endsWith("Z") ? fechaHora : fechaHora + "-05:00"
      );

      if (isNaN(parsed.getTime()))
        return res.status(400).json({ message: "Fecha inválida" });

      nuevaFechaHoraUTC = parsed;
    }

    const nuevaFechaFinUTC = addMinutes(
      nuevaFechaHoraUTC,
      cita.duracionMinutos
    );

    const conflict = await Cita.findOne({
      where: {
        id: { [Op.ne]: id },
        barberoId: cita.barberoId,
        estado: { [Op.in]: ["pendiente", "confirmada", "bloqueo"] },
        fechaHora: { [Op.lt]: nuevaFechaFinUTC },
        fechaFin: { [Op.gt]: nuevaFechaHoraUTC },
      },
    });

    if (conflict) {
      return res.status(409).json({
        message: "Conflicto: el barbero tiene otra cita en ese horario."
      });
    }

    cita.nombreCliente = nombreCliente ?? cita.nombreCliente;
    cita.emailCliente = emailCliente ?? cita.emailCliente;
    cita.whatsappCliente = whatsappCliente ?? cita.whatsappCliente;
    cita.precioFinal = precioFinal ?? cita.precioFinal;
    cita.notas = notas ?? cita.notas;
    cita.estado = estado ?? cita.estado;
    cita.fechaHora = nuevaFechaHoraUTC;
    cita.fechaFin = nuevaFechaFinUTC;

    await cita.save();

    return res.json({ message: "Cita actualizada", cita });
  } catch (error: any) {
    console.error("❌ ERROR updateCita:", error);
    return res.status(500).json({
      error: "Error actualizando la cita",
      details: error.message,
    });
  }
};

export const deleteCita = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const cita = await Cita.findByPk(id);
    if (!cita)
      return res.status(404).json({ message: "Cita no encontrada" });

    await cita.destroy();

    return res.json({
      message: "Cita eliminada correctamente",
      id
    });
  } catch (error: any) {
    console.error("❌ ERROR eliminando cita:", error);
    return res.status(500).json({
      error: "Error eliminando cita",
      details: error.message,
    });
  }
};

export const getCitas = async (_req: Request, res: Response) => {
  try {
    const citas = await Cita.findAll({
      include: [
        {
          model: Service,
          as: "servicioCita",
          attributes: ["id", "nombre", "precio", "duracion"],
        },
        {
          model: User,
          as: "barberoCita",
          attributes: ["id", "nombre", "apellido", "avatar"],
        },
      ],
      order: [["fechaHora", "ASC"]],
    });

    return res.json(citas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error obteniendo citas" });
  }
};

export const getCitaById = async (req: Request, res: Response) => {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    return res.json(cita);
  } catch (err) {
    return res.status(500).json({ message: "Error obteniendo cita" });
  }
};
