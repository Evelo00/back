import type { Request, Response } from "express";
import Cita from "../models/citas";
import { User } from "../models/user";
import { Op } from "sequelize";
import Service from "../models/service";
import CitaServicio from "../models/citaServicio";
import { addMinutes, parseISO, format } from "date-fns";

const BLOQUEO_SERVICE_ID = "00000000-0000-0000-0000-000000000999";

function getDaySchedule(dateStr: string) {
  const [year, month, dayNum] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, dayNum);
  const day = date.getDay();

  if (day === 0) return { start: "10:00", last: "18:30" };
  if (day >= 1 && day <= 4) return { start: "08:00", last: "19:30" };
  if (day === 5 || day === 6) return { start: "08:00", last: "20:30" };
  return { start: "08:00", last: "19:30" };
}

const generateTimeSlots = (start: string, end: string, interval = 15): string[] => {
  const slots: string[] = [];
  let current = parseISO(`2000-01-01T${start}:00`);
  const endLimit = parseISO(`2000-01-01T${end}:00`);

  while (current <= endLimit) {
    slots.push(format(current, "HH:mm"));
    current = addMinutes(current, interval);
  }

  return slots;
};

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { date, serviceDuration, barberoId } = req.query;

    if (!date || !serviceDuration || !barberoId)
      return res.status(400).json({ message: "Faltan parámetros requeridos" });

    const dateStr = String(date);
    const duration = parseInt(serviceDuration as string, 10);

    const startUTC = new Date(`${dateStr}T00:00:00-05:00`);
    const endUTC = new Date(`${dateStr}T23:59:59-05:00`);

    const citas = await Cita.findAll({
      where: {
        barberoId: String(barberoId),
        fechaHora: { [Op.between]: [startUTC, endUTC] },
      },
    });

    const { start, last } = getDaySchedule(dateStr);
    const allSlots = generateTimeSlots(start, last);

    const availableSlots: string[] = [];

    for (const slot of allSlots) {
      const slotStartUTC = new Date(`${dateStr}T${slot}:00-05:00`);
      const slotEndUTC = addMinutes(slotStartUTC, duration);

      const hasConflict = citas.some((cita) => {
        const inicio = new Date(cita.fechaHora);
        const fin = cita.fechaFin ?? addMinutes(inicio, cita.duracionMinutos);
        return slotStartUTC < fin && slotEndUTC > inicio;
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
      servicios,
      fechaHora,
      fechaFin,
      duracionMinutos,
      nombreCliente,
      emailCliente,
      whatsappCliente,
      notas,
      servicioId,
    } = req.body;

    if (!barberoId || !fechaHora)
      return res.status(400).json({ message: "Faltan campos requeridos" });

    const inicio = new Date(fechaHora);
    if (isNaN(inicio.getTime()))
      return res.status(400).json({ message: "fechaHora inválida" });

    const isBloqueo = servicioId === BLOQUEO_SERVICE_ID;

    if (isBloqueo) {
      const fin = new Date(fechaFin);
      const nueva = await Cita.create({
        clienteId: null,
        barberoId,
        servicioId: BLOQUEO_SERVICE_ID,
        fechaHora: inicio,
        fechaFin: fin,
        duracionMinutos: duracionMinutos ?? 30,
        estado: "bloqueo",
        precioFinal: 0,
        nombreCliente: null,
        emailCliente: null,
        whatsappCliente: null,
        notas: notas ?? null,
      });
      return res.status(201).json(nueva);
    }

    if (!Array.isArray(servicios) || servicios.length === 0) {
      return res.status(400).json({ message: "Debe seleccionar al menos un servicio." });
    }

    const found = await Service.findAll({ where: { id: servicios } });
    if (found.length !== servicios.length)
      return res.status(400).json({ message: "Servicio inválido." });

    const totalDuracion = found.reduce((sum, s) => sum + s.duracion, 0);
    const totalPrecio = found.reduce((sum, s) => sum + s.precio, 0);

    const fin = addMinutes(inicio, totalDuracion);

    const conflict = await Cita.findOne({
      where: {
        barberoId,
        fechaHora: { [Op.lt]: fin },
        fechaFin: { [Op.gt]: inicio },
        estado: { [Op.in]: ["pendiente", "confirmada", "bloqueo"] },
      },
    });

    if (conflict) {
      return res.status(409).json({
        message: "El barbero ya tiene una cita o bloqueo en ese horario",
      });
    }

    const nuevaCita = await Cita.create({
      clienteId,
      barberoId,
      servicioId: null,
      fechaHora: inicio,
      fechaFin: fin,
      duracionMinutos: totalDuracion,
      precioFinal: totalPrecio,
      estado: "confirmada",
      nombreCliente,
      emailCliente,
      whatsappCliente,
      notas: notas ?? null,
    });

    await CitaServicio.bulkCreate(
      found.map((s) => ({
        citaId: nuevaCita.id,
        servicioId: s.id,
        precio: s.precio,
        duracion: s.duracion,
      }))
    );

    return res.status(201).json({
      message: "Cita creada con múltiples servicios",
      cita: nuevaCita,
      servicios: found,
    });
  } catch (error: any) {
    console.error("❌ ERROR createCita:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateCita = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nombreCliente,
      emailCliente,
      whatsappCliente,
      fechaHora,
      notas,
      precioFinal,
      duracionMinutos,
      servicios = []
    } = req.body;

    const cita = await Cita.findByPk(id, {
      include: [{ model: CitaServicio, as: "servicios" }],
    });

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    await cita.update({
      nombreCliente,
      emailCliente,
      whatsappCliente,
      fechaHora,
      notas,
      precioFinal,
      duracionMinutos
    });

    await CitaServicio.destroy({ where: { citaId: id } });

    for (const s of servicios) {
      if (!s.servicioId)
        throw new Error("Servicio recibido sin servicioId");

      await CitaServicio.create({
        citaId: id,
        servicioId: s.servicioId,
        precio: Number(s.precio),
        duracion: Number(s.duracion),
      });
    }
    const updated = await Cita.findByPk(id, {
      include: [
        {
          model: CitaServicio,
          as: "servicios",
          include: [{ model: Service, as: "servicio" }],
        },
      ],
    });

    return res.json({ message: "Cita actualizada", cita: updated });
  } catch (err) {
    console.error("❌ Error UPDATE CITA:", err);
    res.status(500).json({ error: err instanceof Error ? err.message : "Error desconocido" });
  }
};


export const getCitas = async (_req: Request, res: Response) => {
  try {
    const citas = await Cita.findAll({
      include: [
        {
          model: CitaServicio,
          as: "servicios",
          include: [{ model: Service, as: "servicio" }],
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
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Error obteniendo citas" });
  }
};

export const getCitaById = async (req: Request, res: Response) => {
  try {
    const cita = await Cita.findByPk(req.params.id, {
      include: [
        {
          model: CitaServicio,
          as: "servicios",
          include: [{ model: Service, as: "servicio" }],
        },
        {
          model: User,
          as: "barberoCita",
          attributes: ["id", "nombre", "apellido", "avatar"],
        },
      ],
    });

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    return res.json(cita);
  } catch (err) {
    return res.status(500).json({ message: "Error obteniendo cita" });
  }
};

export const deleteCita = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    await CitaServicio.destroy({ where: { citaId: id } });

    const cita = await Cita.findByPk(id);
    if (!cita)
      return res.status(404).json({ message: "Cita no encontrada" });

    await cita.destroy();

    return res.json({ message: "Cita eliminada correctamente", id });
  } catch (error: any) {
    console.error("❌ ERROR eliminando cita:", error);
    return res.status(500).json({
      error: "Error eliminando cita",
      details: error.message,
    });
  }
};
