"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDetalleVenta = exports.updateDetalleVenta = exports.createDetalleVenta = exports.getDetalleVentaById = exports.getDetallesVenta = void 0;
const detalleVenta_1 = __importDefault(require("../models/detalleVenta"));
const getDetallesVenta = async (req, res) => {
    try {
        const detalles = await detalleVenta_1.default.findAll();
        res.json(detalles);
    }
    catch {
        res.status(500).json({ error: "Error al obtener detalles de venta" });
    }
};
exports.getDetallesVenta = getDetallesVenta;
const getDetalleVentaById = async (req, res) => {
    try {
        const detalle = await detalleVenta_1.default.findByPk(req.params.id);
        if (!detalle)
            return res.status(404).json({ error: "Detalle no encontrado" });
        res.json(detalle);
    }
    catch {
        res.status(500).json({ error: "Error al obtener detalle de venta" });
    }
};
exports.getDetalleVentaById = getDetalleVentaById;
const createDetalleVenta = async (req, res) => {
    try {
        const detalle = await detalleVenta_1.default.create(req.body);
        res.status(201).json(detalle);
    }
    catch {
        res.status(400).json({ error: "Error al crear detalle de venta" });
    }
};
exports.createDetalleVenta = createDetalleVenta;
const updateDetalleVenta = async (req, res) => {
    try {
        const detalle = await detalleVenta_1.default.findByPk(req.params.id);
        if (!detalle)
            return res.status(404).json({ error: "Detalle no encontrado" });
        await detalle.update(req.body);
        res.json(detalle);
    }
    catch {
        res.status(400).json({ error: "Error al actualizar detalle de venta" });
    }
};
exports.updateDetalleVenta = updateDetalleVenta;
const deleteDetalleVenta = async (req, res) => {
    try {
        const detalle = await detalleVenta_1.default.findByPk(req.params.id);
        if (!detalle)
            return res.status(404).json({ error: "Detalle no encontrado" });
        await detalle.destroy();
        res.json({ message: "Detalle de venta eliminado correctamente" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar detalle de venta" });
    }
};
exports.deleteDetalleVenta = deleteDetalleVenta;
