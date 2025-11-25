"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVenta = exports.updateVenta = exports.createVenta = exports.getVentaById = exports.getVentas = void 0;
const venta_1 = __importDefault(require("../models/venta"));
const getVentas = async (req, res) => {
    try {
        const ventas = await venta_1.default.findAll();
        res.json(ventas);
    }
    catch {
        res.status(500).json({ error: "Error al obtener ventas" });
    }
};
exports.getVentas = getVentas;
const getVentaById = async (req, res) => {
    try {
        const venta = await venta_1.default.findByPk(req.params.id);
        if (!venta)
            return res.status(404).json({ error: "Venta no encontrada" });
        res.json(venta);
    }
    catch {
        res.status(500).json({ error: "Error al obtener venta" });
    }
};
exports.getVentaById = getVentaById;
const createVenta = async (req, res) => {
    try {
        const venta = await venta_1.default.create(req.body);
        res.status(201).json(venta);
    }
    catch {
        res.status(400).json({ error: "Error al crear venta" });
    }
};
exports.createVenta = createVenta;
const updateVenta = async (req, res) => {
    try {
        const venta = await venta_1.default.findByPk(req.params.id);
        if (!venta)
            return res.status(404).json({ error: "Venta no encontrada" });
        await venta.update(req.body);
        res.json(venta);
    }
    catch {
        res.status(400).json({ error: "Error al actualizar venta" });
    }
};
exports.updateVenta = updateVenta;
const deleteVenta = async (req, res) => {
    try {
        const venta = await venta_1.default.findByPk(req.params.id);
        if (!venta)
            return res.status(404).json({ error: "Venta no encontrada" });
        await venta.destroy();
        res.json({ message: "Venta eliminada correctamente" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar venta" });
    }
};
exports.deleteVenta = deleteVenta;
