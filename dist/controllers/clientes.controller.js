"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarClientes = exports.getClientes = exports.createCliente = void 0;
const sequelize_1 = require("sequelize");
const cliente_1 = __importDefault(require("../models/cliente"));
/**
 * Crear cliente manualmente (admin)
 */
const createCliente = async (req, res) => {
    try {
        const { nombre, telefono, email } = req.body;
        if (!nombre || nombre.trim().length < 2) {
            return res.status(400).json({ message: "Nombre inválido" });
        }
        if (!telefono || !/^[0-9]{7,15}$/.test(telefono)) {
            return res.status(400).json({ message: "Teléfono inválido" });
        }
        // Verificar duplicado
        const exists = await cliente_1.default.findOne({
            where: { telefono },
        });
        if (exists) {
            return res.status(409).json({
                message: "Ya existe un cliente con ese teléfono",
            });
        }
        const cliente = await cliente_1.default.create({
            nombre: nombre.trim(),
            telefono,
            email: email || null,
        });
        return res.status(201).json(cliente);
    }
    catch (error) {
        console.error("❌ ERROR createCliente:", error);
        return res.status(500).json({ message: "Error creando cliente" });
    }
};
exports.createCliente = createCliente;
/**
 * Listar clientes (admin)
 */
const getClientes = async (_req, res) => {
    try {
        const clientes = await cliente_1.default.findAll({
            order: [["createdAt", "DESC"]],
        });
        return res.json(clientes);
    }
    catch (error) {
        console.error("❌ ERROR getClientes:", error);
        return res.status(500).json({ message: "Error obteniendo clientes" });
    }
};
exports.getClientes = getClientes;
/**
 * Buscar clientes (autocomplete)
 */
const buscarClientes = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || String(q).trim().length < 2) {
            return res.json([]);
        }
        const term = String(q).trim();
        const clientes = await cliente_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { nombre: { [sequelize_1.Op.iLike]: `%${term}%` } },
                    { telefono: { [sequelize_1.Op.iLike]: `%${term}%` } },
                ],
            },
            limit: 10,
            order: [["createdAt", "DESC"]],
        });
        return res.json(clientes);
    }
    catch (error) {
        console.error("❌ ERROR buscarClientes:", error);
        return res.status(500).json({ message: "Error buscando clientes" });
    }
};
exports.buscarClientes = buscarClientes;
