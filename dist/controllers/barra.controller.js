"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBarra = exports.updateBarra = exports.createBarra = exports.getBarraById = exports.getBarras = void 0;
const barra_1 = __importDefault(require("../models/barra"));
const getBarras = async (req, res) => {
    try {
        const barras = await barra_1.default.findAll();
        res.json(barras);
    }
    catch {
        res.status(500).json({ error: "Error al obtener barras" });
    }
};
exports.getBarras = getBarras;
const getBarraById = async (req, res) => {
    try {
        const barra = await barra_1.default.findByPk(req.params.id);
        if (!barra)
            return res.status(404).json({ error: "Barra no encontrada" });
        res.json(barra);
    }
    catch {
        res.status(500).json({ error: "Error al obtener barra" });
    }
};
exports.getBarraById = getBarraById;
const createBarra = async (req, res) => {
    try {
        const barra = await barra_1.default.create(req.body);
        res.status(201).json(barra);
    }
    catch {
        res.status(400).json({ error: "Error al crear barra" });
    }
};
exports.createBarra = createBarra;
const updateBarra = async (req, res) => {
    try {
        const barra = await barra_1.default.findByPk(req.params.id);
        if (!barra)
            return res.status(404).json({ error: "Barra no encontrada" });
        await barra.update(req.body);
        res.json(barra);
    }
    catch {
        res.status(400).json({ error: "Error al actualizar barra" });
    }
};
exports.updateBarra = updateBarra;
const deleteBarra = async (req, res) => {
    try {
        const barra = await barra_1.default.findByPk(req.params.id);
        if (!barra)
            return res.status(404).json({ error: "Barra no encontrada" });
        await barra.destroy();
        res.json({ message: "Barra eliminada correctamente" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar barra" });
    }
};
exports.deleteBarra = deleteBarra;
