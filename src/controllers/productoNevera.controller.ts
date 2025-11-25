// src/controllers/productoNevera.controller.ts
// src/controllers/productoNevera.controller.ts
import type { Request, Response } from "express";
import ProductoNevera from "../models/ProductoNevera";

export const getProductosNevera = async (req: Request, res: Response) => {
  try {
    const productos = await ProductoNevera.findAll();
    res.json(productos);
  } catch {
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

export const getProductoNeveraById = async (req: Request, res: Response) => {
  try {
    const producto = await ProductoNevera.findByPk(req.params.id);
    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch {
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

export const createProductoNevera = async (req: Request, res: Response) => {
  try {
    const producto = await ProductoNevera.create(req.body);
    res.status(201).json(producto);
  } catch {
    res.status(400).json({ error: "Error al crear producto" });
  }
};

export const updateProductoNevera = async (req: Request, res: Response) => {
  try {
    const producto = await ProductoNevera.findByPk(req.params.id);
    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });
    await producto.update(req.body);
    res.json(producto);
  } catch {
    res.status(400).json({ error: "Error al actualizar producto" });
  }
};

export const deleteProductoNevera = async (req: Request, res: Response) => {
  try {
    const producto = await ProductoNevera.findByPk(req.params.id);
    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });
    await producto.destroy();
    res.json({ message: "Producto eliminado correctamente" });
  } catch {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};
