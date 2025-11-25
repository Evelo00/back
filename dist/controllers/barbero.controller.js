"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearSolicitudCaja = exports.obtenerGananciasSemana = exports.obtenerMisCitas = void 0;
const citas_1 = __importDefault(require("../models/citas"));
const service_1 = __importDefault(require("../models/service"));
const sequelize_1 = require("sequelize");
const solicitud_model_1 = require("../models/solicitud.model");
const obtenerMisCitas = async (req, res) => {
    try {
        const barberoId = req.user.id;
        const citas = await citas_1.default.findAll({
            where: { barberoId },
            order: [["fechaHora", "ASC"]],
            include: [
                { model: service_1.default, as: "servicioCita" },
                { model: citas_1.default.sequelize?.models.User || citas_1.default.sequelize.models.User, as: "clienteCita" },
            ],
        });
        return res.json(citas);
    }
    catch (error) {
        console.error("❌ ERROR obtenerMisCitas:", error);
        return res.status(500).json({ message: "Error al obtener citas" });
    }
};
exports.obtenerMisCitas = obtenerMisCitas;
const obtenerGananciasSemana = async (req, res) => {
    try {
        const barberoId = req.user.id;
        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        const finalSemana = new Date(inicioSemana);
        finalSemana.setDate(inicioSemana.getDate() + 6);
        const citas = await citas_1.default.findAll({
            where: {
                barberoId,
                fechaHora: { [sequelize_1.Op.between]: [inicioSemana, finalSemana] },
            },
        });
        const total = citas.reduce((sum, cita) => sum + (cita.precioFinal || 0), 0);
        return res.json({ total, citas });
    }
    catch (error) {
        console.error("❌ ERROR obtenerGananciasSemana:", error);
        return res.status(500).json({ message: "Error al obtener ganancias" });
    }
};
exports.obtenerGananciasSemana = obtenerGananciasSemana;
const crearSolicitudCaja = async (req, res) => {
    try {
        const barberoId = req.user.id;
        const { tipo, descripcion } = req.body;
        const nueva = await solicitud_model_1.SolicitudCaja.create({
            barberoId,
            tipo,
            descripcion,
            estado: "pendiente",
        });
        return res.json(nueva);
    }
    catch (error) {
        console.error("❌ ERROR crearSolicitudCaja:", error);
        return res.status(500).json({ message: "Error al crear solicitud" });
    }
};
exports.crearSolicitudCaja = crearSolicitudCaja;
