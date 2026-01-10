"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSede = exports.updateSede = exports.createSede = exports.getSedeById = exports.getSedes = void 0;
const models_1 = require("../models");
const getSedes = async (req, res) => {
    try {
        const sedes = await models_1.Sede.findAll();
        res.json(sedes);
    }
    catch {
        res.status(500).json({ error: "Error al obtener sedes" });
    }
};
exports.getSedes = getSedes;
const getSedeById = async (req, res) => {
    try {
        const id = req.params.id;
        const sede = await models_1.Sede.findByPk(id);
        if (!sede)
            return res.status(404).json({ error: "Sede no encontrada" });
        res.json(sede);
    }
    catch {
        res.status(500).json({ error: "Error al obtener sede" });
    }
};
exports.getSedeById = getSedeById;
const createSede = async (req, res) => {
    try {
        const sede = await models_1.Sede.create(req.body);
        res.status(201).json(sede);
    }
    catch {
        res.status(400).json({ error: "Error al crear sede" });
    }
};
exports.createSede = createSede;
const updateSede = async (req, res) => {
    try {
        const id = req.params.id;
        const sede = await models_1.Sede.findByPk(id);
        if (!sede)
            return res.status(404).json({ error: "Sede no encontrada" });
        await sede.update(req.body);
        res.json(sede);
    }
    catch {
        res.status(400).json({ error: "Error al actualizar sede" });
    }
};
exports.updateSede = updateSede;
const deleteSede = async (req, res) => {
    try {
        const id = req.params.id;
        const sede = await models_1.Sede.findByPk(id);
        if (!sede)
            return res.status(404).json({ error: "Sede no encontrada" });
        await sede.destroy();
        res.json({ message: "Sede eliminada correctamente" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar sede" });
    }
};
exports.deleteSede = deleteSede;
