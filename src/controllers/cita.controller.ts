import type { Request, Response } from "express";
import Cita from "../models/citas";
import { Op } from "sequelize";
import {
  addMinutes,
  startOfDay,
  endOfDay,
  parseISO,
  format
} from "date-fns";

const colombiaToUTC = (iso: string): Date => {
  const [datePart, timePart] = iso.split("T");

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Colombia = UTC-5 → para convertir a UTC: sumar 5 horas
  return new Date(Date.UTC(year, month - 1, day, hour + 5, minute, 0));
};

const generateTimeSlots = (
  start: string,
  end: string,
  duration: number,
  interval = 30
): string[] => {
  const slots: string[] = [];
  let current = parseISO(`2000-01-01T${start}:00`);
  const endTime = parseISO(`2000-01-01T${end}:00`);

  while (current < endTime) {
    const potentialEnd = addMinutes(current, duration);
    if (potentialEnd <= endTime) {
      slots.push(format(current, "HH:mm"));
    }
    current = addMinutes(current, interval);
  }

  return slots;
};

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { date, serviceDuration } = req.query;

    let barberoId = req.query.barberoId;
    if (Array.isArray(barberoId)) barberoId = barberoId[0];

    if (!date || !serviceDuration || !barberoId) {
      return res.status(400).json({
        message: "Faltan parámetros requeridos",
      });
    }

    const durationMinutes = parseInt(serviceDuration as string, 10);

    // Interpretar fecha YYYY-MM-DD como COL (00:00 COL)
    const dateStartUTC = colombiaToUTC(date + "T00:00:00");

    const startUTC = startOfDay(dateStartUTC);
    const endUTC = endOfDay(dateStartUTC);

    // Buscar citas guardadas en UTC dentro del día
    const citas = await Cita.findAll({
      where: {
        barberoId,
        fechaHora: { [Op.between]: [startUTC, endUTC] },
      },
    });

    const SHOP_OPEN = "09:00";
    const SHOP_CLOSE = "21:00";
    const allSlots = generateTimeSlots(SHOP_OPEN, SHOP_CLOSE, durationMinutes);

    const availableSlots: string[] = [];

    for (const slot of allSlots) {
      const [h, m] = slot.split(":").map(Number);

      // Slot en COL
      const slotCOL = new Date(
        dateStartUTC.getUTCFullYear(),
        dateStartUTC.getUTCMonth(),
        dateStartUTC.getUTCDate(),
        h,
        m,
        0
      );

      // Convertir slot COL → UTC
      const slotUTC = colombiaToUTC(
        `${format(slotCOL, "yyyy-MM-dd")}T${slot}`
      );

      const slotEndUTC = addMinutes(slotUTC, durationMinutes);

      // Comparar contra citas guardadas en UTC
      const hasConflict = citas.some((cita) => {
        const citaStartUTC = new Date(cita.fechaHora);
        const citaEndUTC = cita.fechaFin
          ? new Date(cita.fechaFin)
          : new Date(
              citaStartUTC.getTime() + cita.duracionMinutos * 60000
            );

        return slotUTC < citaEndUTC && slotEndUTC > citaStartUTC;
      });

      if (!hasConflict) availableSlots.push(slot);
    }

    return res.json({ availableSlots });
  } catch (error) {
    console.error("❌ ERROR getAvailability:", error);
    return res.status(500).json({ error: "Error interno", details: String(error) });
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
      notas,
    } = req.body;

    if (!barberoId || !servicioId || !fechaHora) {
      return res.status(400).json({
        message: "Faltan campos requeridos",
      });
    }

    const duration = duracionMinutos ?? 30;

    // Convertir hora COL enviada desde el front → UTC real
    const fechaInicioUTC = colombiaToUTC(fechaHora);
    const fechaFinUTC = addMinutes(fechaInicioUTC, duration);

    const conflict = await Cita.findOne({
      where: {
        barberoId,
        estado: { [Op.in]: ["pendiente", "confirmada"] },
        fechaHora: { [Op.lt]: fechaFinUTC },
        fechaFin: { [Op.gt]: fechaInicioUTC },
      },
    });

    if (conflict) {
      return res.status(409).json({
        message: "El barbero ya tiene una cita en ese horario.",
      });
    }

    const nueva = await Cita.create({
      clienteId: clienteId || null,
      barberoId,
      servicioId,
      fechaHora: fechaInicioUTC,
      fechaFin: fechaFinUTC,
      estado: "confirmada",
      precioFinal: precioFinal ?? 0,
      duracionMinutos: duration,
      nombreCliente,
      emailCliente,
      whatsappCliente,
      notas,
    });

    return res.status(201).json(nueva);
  } catch (e: any) {
    console.error("❌ ERROR createCita:", e);
    return res.status(400).json({ error: "Error al crear cita", details: e.message });
  }
};

export const updateCita = async (req: Request, res: Response) => {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });

    const { fechaHora, duracionMinutos, ...rest } = req.body;

    const updates: any = rest;

    if (fechaHora || duracionMinutos) {
      const newStartDate = fechaHora
        ? colombiaToUTC(fechaHora) // Correcta interpretación
        : new Date(cita.fechaHora); // Ya está en UTC

      const newDuration = duracionMinutos ?? cita.duracionMinutos ?? 30;

      updates.fechaHora = newStartDate;
      updates.duracionMinutos = newDuration;
      updates.fechaFin = addMinutes(newStartDate, newDuration);

      const conflictAppointment = await Cita.findOne({
        where: {
          barberoId: cita.barberoId,
          estado: { [Op.in]: ["pendiente", "confirmada"] },
          id: { [Op.ne]: cita.id },
          fechaHora: { [Op.lt]: updates.fechaFin },
          fechaFin: { [Op.gt]: updates.fechaHora },
        },
      });

      if (conflictAppointment) {
        return res.status(409).json({
          message: "La actualización de la cita se solapa con una cita existente.",
        });
      }
    }

    await cita.update(updates);
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

export const getCitas = async (req: Request, res: Response) => {
    try {
        const citas = await Cita.findAll();
        return res.json(citas);
    } catch (err) {
        return res.status(500).json({ message: "Error obteniendo citas" });
    }
};

export const getCitaById = async (req: Request, res: Response) => {
    try {
        const cita = await Cita.findByPk(req.params.id);

        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }

        return res.json(cita);
    } catch (err) {
        return res.status(500).json({ message: "Error obteniendo cita" });
    }
};