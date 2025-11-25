// src/controllers/vitrina.controller.ts
import type { Request, Response } from "express";
import VitrinaCounter from "../models/VitrinaCounter";

export const getVitrinas = async (req: Request, res: Response) => {
  try {
    const vitrinas = await VitrinaCounter.findAll();
    res.json(vitrinas);
  } catch {
    res.status(500).json({ error: "Error al obtener vitrinas" });
  }
};

export const getVitrinaById = async (req: Request, res: Response) => {
  try {
    const vitrina = await VitrinaCounter.findByPk(req.params.id);
    if (!vitrina)
      return res.status(404).json({ error: "Vitrina no encontrada" });
    res.json(vitrina);
  } catch {
    res.status(500).json({ error: "Error al obtener vitrina" });
  }
};

export const createVitrina = async (req: Request, res: Response) => {
  try {
    const vitrina = await VitrinaCounter.create(req.body);
    res.status(201).json(vitrina);
  } catch {
    res.status(400).json({ error: "Error al crear vitrina" });
  }
};

export const updateVitrina = async (req: Request, res: Response) => {
  try {
    const vitrina = await VitrinaCounter.findByPk(req.params.id);
    if (!vitrina)
      return res.status(404).json({ error: "Vitrina no encontrada" });
    await vitrina.update(req.body);
    res.json(vitrina);
  } catch {
    res.status(400).json({ error: "Error al actualizar vitrina" });
  }
};

export const deleteVitrina = async (req: Request, res: Response) => {
  try {
    const vitrina = await VitrinaCounter.findByPk(req.params.id);
    if (!vitrina)
      return res.status(404).json({ error: "Vitrina no encontrada" });
    await vitrina.destroy();
    res.json({ message: "Vitrina eliminada correctamente" });
  } catch {
    res.status(500).json({ error: "Error al eliminar vitrina" });
  }
};
