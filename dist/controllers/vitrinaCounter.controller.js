"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVitrina = exports.updateVitrina = exports.createVitrina = exports.getVitrinaById = exports.getVitrinas = void 0;
const vitrinaCounter_1 = __importDefault(require("../models/vitrinaCounter"));
const getVitrinas = async (req, res) => {
    try {
        const vitrinas = await vitrinaCounter_1.default.findAll();
        res.json(vitrinas);
    }
    catch {
        res.status(500).json({ error: "Error al obtener vitrinas" });
    }
};
exports.getVitrinas = getVitrinas;
const getVitrinaById = async (req, res) => {
    try {
        const vitrina = await vitrinaCounter_1.default.findByPk(req.params.id);
        if (!vitrina)
            return res.status(404).json({ error: "Vitrina no encontrada" });
        res.json(vitrina);
    }
    catch {
        res.status(500).json({ error: "Error al obtener vitrina" });
    }
};
exports.getVitrinaById = getVitrinaById;
const createVitrina = async (req, res) => {
    try {
        const vitrina = await vitrinaCounter_1.default.create(req.body);
        res.status(201).json(vitrina);
    }
    catch {
        res.status(400).json({ error: "Error al crear vitrina" });
    }
};
exports.createVitrina = createVitrina;
const updateVitrina = async (req, res) => {
    try {
        const vitrina = await vitrinaCounter_1.default.findByPk(req.params.id);
        if (!vitrina)
            return res.status(404).json({ error: "Vitrina no encontrada" });
        await vitrina.update(req.body);
        res.json(vitrina);
    }
    catch {
        res.status(400).json({ error: "Error al actualizar vitrina" });
    }
};
exports.updateVitrina = updateVitrina;
const deleteVitrina = async (req, res) => {
    try {
        const vitrina = await vitrinaCounter_1.default.findByPk(req.params.id);
        if (!vitrina)
            return res.status(404).json({ error: "Vitrina no encontrada" });
        await vitrina.destroy();
        res.json({ message: "Vitrina eliminada correctamente" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar vitrina" });
    }
};
exports.deleteVitrina = deleteVitrina;
