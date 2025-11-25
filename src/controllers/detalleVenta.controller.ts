// src/controllers/detalleVenta.controller.ts
import type { Request, Response } from "express";
import DetalleVenta from "../models/DetalleVenta";

export const getDetallesVenta = async (req: Request, res: Response) => {
  try {
    const detalles = await DetalleVenta.findAll();
    res.json(detalles);
  } catch {
    res.status(500).json({ error: "Error al obtener detalles de venta" });
  }
};

export const getDetalleVentaById = async (req: Request, res: Response) => {
  try {
    const detalle = await DetalleVenta.findByPk(req.params.id);
    if (!detalle)
      return res.status(404).json({ error: "Detalle no encontrado" });
    res.json(detalle);
  } catch {
    res.status(500).json({ error: "Error al obtener detalle de venta" });
  }
};

export const createDetalleVenta = async (req: Request, res: Response) => {
  try {
    const detalle = await DetalleVenta.create(req.body);
    res.status(201).json(detalle);
  } catch {
    res.status(400).json({ error: "Error al crear detalle de venta" });
  }
};

export const updateDetalleVenta = async (req: Request, res: Response) => {
  try {
    const detalle = await DetalleVenta.findByPk(req.params.id);
    if (!detalle)
      return res.status(404).json({ error: "Detalle no encontrado" });
    await detalle.update(req.body);
    res.json(detalle);
  } catch {
    res.status(400).json({ error: "Error al actualizar detalle de venta" });
  }
};

export const deleteDetalleVenta = async (req: Request, res: Response) => {
  try {
    const detalle = await DetalleVenta.findByPk(req.params.id);
    if (!detalle)
      return res.status(404).json({ error: "Detalle no encontrado" });
    await detalle.destroy();
    res.json({ message: "Detalle de venta eliminado correctamente" });
  } catch {
    res.status(500).json({ error: "Error al eliminar detalle de venta" });
  }
};
