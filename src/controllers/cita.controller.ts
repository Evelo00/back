import type { Request, Response } from "express";
import Cita from "../models/citas";

/**
 * CRUD básico para Citas:
 * - createCita
 * - getCitas
 * - getCitaById
 * - updateCita
 * - deleteCita
 */

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
    const { clienteId, barberoId, servicioId, fechaHora } = req.body;

    if (!clienteId || !barberoId || !servicioId || !fechaHora) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    const nueva = await Cita.create({
      clienteId,
      barberoId,
      servicioId,
      fechaHora,
    });

    res.status(201).json(nueva);
  } catch (error) {
    res.status(400).json({ error: "Error al crear cita", details: error });
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
