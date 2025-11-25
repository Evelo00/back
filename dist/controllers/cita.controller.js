"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCita = exports.updateCita = exports.createCita = exports.getCitaById = exports.getCitas = void 0;
const citas_1 = __importDefault(require("../models/citas"));
const getCitas = async (_req, res) => {
    try {
        const citas = await citas_1.default.findAll();
        res.json(citas);
    }
    catch (error) {
        res.status(500).json({ error: "Error al obtener citas", details: error });
    }
};
exports.getCitas = getCitas;
const getCitaById = async (req, res) => {
    try {
        const cita = await citas_1.default.findByPk(req.params.id);
        if (!cita)
            return res.status(404).json({ error: "Cita no encontrada" });
        res.json(cita);
    }
    catch (error) {
        res.status(500).json({ error: "Error al obtener cita", details: error });
    }
};
exports.getCitaById = getCitaById;
const createCita = async (req, res) => {
    try {
        const { clienteId, barberoId, servicioId, fechaHora } = req.body;
        if (!clienteId || !barberoId || !servicioId || !fechaHora) {
            return res.status(400).json({ error: "Faltan campos requeridos" });
        }
        const nueva = await citas_1.default.create({
            clienteId,
            barberoId,
            servicioId,
            fechaHora,
        });
        res.status(201).json(nueva);
    }
    catch (error) {
        res.status(400).json({ error: "Error al crear cita", details: error });
    }
};
exports.createCita = createCita;
const updateCita = async (req, res) => {
    try {
        const cita = await citas_1.default.findByPk(req.params.id);
        if (!cita)
            return res.status(404).json({ error: "Cita no encontrada" });
        await cita.update(req.body);
        res.json(cita);
    }
    catch (error) {
        res.status(400).json({ error: "Error al actualizar cita", details: error });
    }
};
exports.updateCita = updateCita;
const deleteCita = async (req, res) => {
    try {
        const cita = await citas_1.default.findByPk(req.params.id);
        if (!cita)
            return res.status(404).json({ error: "Cita no encontrada" });
        await cita.destroy();
        res.json({ message: "Cita eliminada correctamente" });
    }
    catch (error) {
        res.status(500).json({ error: "Error al eliminar cita", details: error });
    }
};
exports.deleteCita = deleteCita;
