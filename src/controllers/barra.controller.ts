// src/controllers/barra.controller.ts
import type { Request, Response } from "express";
import Barra from "../models/Barra";

export const getBarras = async (req: Request, res: Response) => {
  try {
    const barras = await Barra.findAll();
    res.json(barras);
  } catch {
    res.status(500).json({ error: "Error al obtener barras" });
  }
};

export const getBarraById = async (req: Request, res: Response) => {
  try {
    const barra = await Barra.findByPk(req.params.id);
    if (!barra) return res.status(404).json({ error: "Barra no encontrada" });
    res.json(barra);
  } catch {
    res.status(500).json({ error: "Error al obtener barra" });
  }
};

export const createBarra = async (req: Request, res: Response) => {
  try {
    const barra = await Barra.create(req.body);
    res.status(201).json(barra);
  } catch {
    res.status(400).json({ error: "Error al crear barra" });
  }
};

export const updateBarra = async (req: Request, res: Response) => {
  try {
    const barra = await Barra.findByPk(req.params.id);
    if (!barra) return res.status(404).json({ error: "Barra no encontrada" });
    await barra.update(req.body);
    res.json(barra);
  } catch {
    res.status(400).json({ error: "Error al actualizar barra" });
  }
};

export const deleteBarra = async (req: Request, res: Response) => {
  try {
    const barra = await Barra.findByPk(req.params.id);
    if (!barra) return res.status(404).json({ error: "Barra no encontrada" });
    await barra.destroy();
    res.json({ message: "Barra eliminada correctamente" });
  } catch {
    res.status(500).json({ error: "Error al eliminar barra" });
  }
};
