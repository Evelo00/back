import type { Request, Response } from "express";
import Cita from "../models/citas";
import { User } from "../models/user";
import { Op } from "sequelize";
import Service from "../models/service";

import {
  addMinutes,
  parseISO,
  format
} from "date-fns";

const SHOP_OPEN = "09:00";
const SHOP_CLOSE = "21:00";

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
      return res.status(400).json({ message: "Faltan parámetros requeridos" });
    }

    const durationMinutes = parseInt(serviceDuration as string, 10);
    const dateStr = String(date);

    // BOGOTÁ LOCAL
    const dayStartBogota = new Date(`${dateStr}T00:00:00-05:00`);
    const dayEndBogota = new Date(`${dateStr}T23:59:59-05:00`);

    // Convertir a UTC
    const startUTC = new Date(dayStartBogota.getTime() + 5 * 3600 * 1000);
    const endUTC = new Date(dayEndBogota.getTime() + 5 * 3600 * 1000);

    const citas = await Cita.findAll({
      where: {
        barberoId,
        fechaHora: { [Op.between]: [startUTC, endUTC] },
      },
    });

    const allSlots = generateTimeSlots(SHOP_OPEN, SHOP_CLOSE, durationMinutes);
    const availableSlots: string[] = [];

    for (const slot of allSlots) {
      const slotStartUTC = new Date(`${dateStr}T${slot}:00-05:00`);
      const slotEndUTC = addMinutes(slotStartUTC, durationMinutes);

      const hasConflict = citas.some((cita) => {
        const citaStartUTC = new Date(cita.fechaHora);
        const citaEndUTC =
          cita.fechaFin ?? addMinutes(citaStartUTC, cita.duracionMinutos);

        return slotStartUTC < citaEndUTC && slotEndUTC > citaStartUTC;
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
      precioFinal,
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

    // 🔥 Duración REAL del servicio
    const servicio = await Service.findByPk(servicioId);
    const duration =
      servicio?.duracion && servicio.duracion > 0
        ? Number(servicio.duracion)
        : 30;

    console.log("⏱ duración usada (min):", duration);

    // Fecha ya viene en UTC desde el front
    const fechaInicioUTC = new Date(fechaHora);
    const fechaFinUTC = addMinutes(fechaInicioUTC, duration);

    // 🔥 Solapamiento
    const conflict = await Cita.findOne({
      where: {
        barberoId,
        estado: { [Op.in]: ["pendiente", "confirmada"] },
        fechaHora: { [Op.lt]: fechaFinUTC },
        fechaFin: { [Op.gt]: fechaInicioUTC },
      },
    });

    if (conflict) {
      console.log("❌ SOLAPAMIENTO DETECTADO:");
      console.log("   → cita inicio:", conflict.fechaHora);
      console.log("   → cita fin   :", conflict.fechaFin);
      console.log("   → slot inicio:", fechaInicioUTC);
      console.log("   → slot fin   :", fechaFinUTC);

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

  } catch (error: any) {
    console.error("❌ ERROR createCita:", error);
    return res
      .status(400)
      .json({ error: "Error al crear cita", details: error.message });
  }
};



export const updateCita = async (req: Request, res: Response) => {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });

    const { fechaHora, duracionMinutos, ...rest } = req.body;
    const updates: any = rest;

    if (fechaHora || duracionMinutos) {
      const nuevaFechaUTC = fechaHora
        ? new Date(fechaHora)
        : new Date(cita.fechaHora);

      const newDuration = duracionMinutos ?? cita.duracionMinutos ?? 30;

      updates.fechaHora = nuevaFechaUTC;
      updates.duracionMinutos = newDuration;
      updates.fechaFin = addMinutes(nuevaFechaUTC, newDuration);

      const conflict = await Cita.findOne({
        where: {
          barberoId: cita.barberoId,
          estado: { [Op.in]: ["pendiente", "confirmada"] },
          id: { [Op.ne]: cita.id },
          fechaHora: { [Op.lt]: updates.fechaFin },
          fechaFin: { [Op.gt]: updates.fechaHora },
        },
      });

      if (conflict) {
        return res.status(409).json({
          message: "La actualización se solapa con otra cita.",
        });
      }
    }

    await cita.update(updates);
    return res.json(cita);

  } catch (error) {
    return res.status(400).json({ error: "Error al actualizar cita", details: error });
  }
};


export const deleteCita = async (req: Request, res: Response) => {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });

    await cita.destroy();
    return res.json({ message: "Cita eliminada correctamente" });

  } catch (error) {
    return res.status(500).json({ error: "Error al eliminar cita", details: error });
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
    if (!cita) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    return res.json(cita);

  } catch (err) {
    return res.status(500).json({ message: "Error obteniendo cita" });
  }
};
