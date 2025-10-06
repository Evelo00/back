// src/controllers/venta.controller.ts
import type { Request, Response } from "express";
import Venta from "../models/venta";

export const getVentas = async (req: Request, res: Response) => {
  try {
    const ventas = await Venta.findAll();
    res.json(ventas);
  } catch {
    res.status(500).json({ error: "Error al obtener ventas" });
  }
};

export const getVentaById = async (req: Request, res: Response) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: "Venta no encontrada" });
    res.json(venta);
  } catch {
    res.status(500).json({ error: "Error al obtener venta" });
  }
};

export const createVenta = async (req: Request, res: Response) => {
  try {
    const venta = await Venta.create(req.body);
    res.status(201).json(venta);
  } catch {
    res.status(400).json({ error: "Error al crear venta" });
  }
};

export const updateVenta = async (req: Request, res: Response) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: "Venta no encontrada" });
    await venta.update(req.body);
    res.json(venta);
  } catch {
    res.status(400).json({ error: "Error al actualizar venta" });
  }
};

export const deleteVenta = async (req: Request, res: Response) => {
  try {
    const venta = await Venta.findByPk(req.params.id);
    if (!venta) return res.status(404).json({ error: "Venta no encontrada" });
    await venta.destroy();
    res.json({ message: "Venta eliminada correctamente" });
  } catch {
    res.status(500).json({ error: "Error al eliminar venta" });
  }
};
