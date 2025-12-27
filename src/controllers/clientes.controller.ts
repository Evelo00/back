import type { Request, Response } from "express";
import { Op } from "sequelize";
import Cliente from "../models/cliente";

/**
 * Crear cliente manualmente (admin)
 */
export const createCliente = async (req: Request, res: Response) => {
  try {
    const { nombre, telefono, email } = req.body;

    if (!nombre || nombre.trim().length < 2) {
      return res.status(400).json({ message: "Nombre inválido" });
    }

    if (!telefono || !/^[0-9]{7,15}$/.test(telefono)) {
      return res.status(400).json({ message: "Teléfono inválido" });
    }

    // Verificar duplicado
    const exists = await Cliente.findOne({
      where: { telefono },
    });

    if (exists) {
      return res.status(409).json({
        message: "Ya existe un cliente con ese teléfono",
      });
    }

    const cliente = await Cliente.create({
      nombre: nombre.trim(),
      telefono,
      email: email || null,
    });

    return res.status(201).json(cliente);
  } catch (error) {
    console.error("❌ ERROR createCliente:", error);
    return res.status(500).json({ message: "Error creando cliente" });
  }
};

/**
 * Listar clientes (admin)
 */
export const getClientes = async (_req: Request, res: Response) => {
  try {
    const clientes = await Cliente.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.json(clientes);
  } catch (error) {
    console.error("❌ ERROR getClientes:", error);
    return res.status(500).json({ message: "Error obteniendo clientes" });
  }
};

/**
 * Buscar clientes (autocomplete)
 */
export const buscarClientes = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || String(q).trim().length < 2) {
      return res.json([]);
    }

    const term = String(q).trim();

    const clientes = await Cliente.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${term}%` } },
          { telefono: { [Op.iLike]: `%${term}%` } },
        ],
      },
      limit: 10,
      order: [["createdAt", "DESC"]],
    });

    return res.json(clientes);
  } catch (error) {
    console.error("❌ ERROR buscarClientes:", error);
    return res.status(500).json({ message: "Error buscando clientes" });
  }
};
