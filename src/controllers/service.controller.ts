// src/controllers/service.controller.ts
// src/controllers/service.controller.ts
import type { Request, Response } from "express";
import Service from "../models/service.js";

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch {
    res.status(500).json({ error: "Error al obtener servicios" });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service)
      return res.status(404).json({ error: "Servicio no encontrado" });
    res.json(service);
  } catch {
    res.status(500).json({ error: "Error al obtener servicio" });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch {
    res.status(400).json({ error: "Error al crear servicio" });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service)
      return res.status(404).json({ error: "Servicio no encontrado" });
    await service.update(req.body);
    res.json(service);
  } catch {
    res.status(400).json({ error: "Error al actualizar servicio" });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service)
      return res.status(404).json({ error: "Servicio no encontrado" });
    await service.destroy();
    res.json({ message: "Servicio eliminado correctamente" });
  } catch {
    res.status(500).json({ error: "Error al eliminar servicio" });
  }
};
