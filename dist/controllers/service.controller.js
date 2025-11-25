"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.getServiceById = exports.getServices = void 0;
const service_1 = __importDefault(require("../models/service"));
const getServices = async (req, res) => {
    try {
        const services = await service_1.default.findAll();
        res.json(services);
    }
    catch {
        res.status(500).json({ error: "Error al obtener servicios" });
    }
};
exports.getServices = getServices;
const getServiceById = async (req, res) => {
    try {
        const service = await service_1.default.findByPk(req.params.id);
        if (!service)
            return res.status(404).json({ error: "Servicio no encontrado" });
        res.json(service);
    }
    catch {
        res.status(500).json({ error: "Error al obtener servicio" });
    }
};
exports.getServiceById = getServiceById;
const createService = async (req, res) => {
    try {
        const service = await service_1.default.create(req.body);
        res.status(201).json(service);
    }
    catch {
        res.status(400).json({ error: "Error al crear servicio" });
    }
};
exports.createService = createService;
const updateService = async (req, res) => {
    try {
        const service = await service_1.default.findByPk(req.params.id);
        if (!service)
            return res.status(404).json({ error: "Servicio no encontrado" });
        await service.update(req.body);
        res.json(service);
    }
    catch {
        res.status(400).json({ error: "Error al actualizar servicio" });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    try {
        const service = await service_1.default.findByPk(req.params.id);
        if (!service)
            return res.status(404).json({ error: "Servicio no encontrado" });
        await service.destroy();
        res.json({ message: "Servicio eliminado correctamente" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar servicio" });
    }
};
exports.deleteService = deleteService;
