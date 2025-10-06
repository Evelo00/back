// src/controllers/sede.controller.ts
// src/controllers/sede.controller.ts
import type { Request, Response } from "express";
import { Sede } from "../models/index";

export const getSedes = async (req: Request, res: Response) => {
  try {
    const sedes = await Sede.findAll();
    res.json(sedes);
  } catch {
    res.status(500).json({ error: "Error al obtener sedes" });
  }
};

export const getSedeById = async (req: Request, res: Response) => {
  try {
    const sede = await Sede.findByPk(req.params.id);
    if (!sede) return res.status(404).json({ error: "Sede no encontrada" });
    res.json(sede);
  } catch {
    res.status(500).json({ error: "Error al obtener sede" });
  }
};

export const createSede = async (req: Request, res: Response) => {
  try {
    const sede = await Sede.create(req.body);
    res.status(201).json(sede);
  } catch {
    res.status(400).json({ error: "Error al crear sede" });
  }
};

export const updateSede = async (req: Request, res: Response) => {
  try {
    const sede = await Sede.findByPk(req.params.id);
    if (!sede) return res.status(404).json({ error: "Sede no encontrada" });
    await sede.update(req.body);
    res.json(sede);
  } catch {
    res.status(400).json({ error: "Error al actualizar sede" });
  }
};

export const deleteSede = async (req: Request, res: Response) => {
  try {
    const sede = await Sede.findByPk(req.params.id);
    if (!sede) return res.status(404).json({ error: "Sede no encontrada" });
    await sede.destroy();
    res.json({ message: "Sede eliminada correctamente" });
  } catch {
    res.status(500).json({ error: "Error al eliminar sede" });
  }
};
