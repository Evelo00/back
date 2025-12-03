"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCitaById = exports.getCitas = exports.deleteCita = exports.updateCita = exports.createCita = exports.getAvailability = void 0;
const citas_1 = __importDefault(require("../models/citas"));
const user_1 = require("../models/user");
const sequelize_1 = require("sequelize");
const service_1 = __importDefault(require("../models/service"));
const date_fns_1 = require("date-fns");
const BLOQUEO_SERVICE_ID = "00000000-0000-0000-0000-000000000999";
function getDaySchedule(dateStr) {
    const [year, month, dayNum] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, dayNum);
    const day = date.getDay(); // 0 domingo
    if (day === 0) {
        return { start: "10:00", last: "18:30" };
    }
    if (day >= 1 && day <= 4) {
        return { start: "08:00", last: "19:30" };
    }
    if (day === 5 || day === 6) {
        return { start: "08:00", last: "20:30" };
    }
    return { start: "08:00", last: "19:30" };
}
const generateTimeSlots = (start, end, interval = 15) => {
    const slots = [];
    let current = (0, date_fns_1.parseISO)(`2000-01-01T${start}:00`);
    const endLimit = (0, date_fns_1.parseISO)(`2000-01-01T${end}:00`);
    while (current <= endLimit) {
        slots.push((0, date_fns_1.format)(current, "HH:mm"));
        current = (0, date_fns_1.addMinutes)(current, interval);
    }
    return slots;
};
const getAvailability = async (req, res) => {
    try {
        const { date, serviceDuration, barberoId } = req.query;
        if (!date || !serviceDuration || !barberoId) {
            return res.status(400).json({ message: "Faltan parámetros requeridos" });
        }
        const dateStr = String(date);
        const duration = parseInt(serviceDuration, 10);
        // rango del día en Bogotá
        const startUTC = new Date(`${dateStr}T00:00:00-05:00`);
        const endUTC = new Date(`${dateStr}T23:59:59-05:00`);
        const citas = await citas_1.default.findAll({
            where: {
                barberoId: String(barberoId),
                fechaHora: { [sequelize_1.Op.between]: [startUTC, endUTC] },
            },
        });
        const { start, last } = getDaySchedule(dateStr);
        const allSlots = generateTimeSlots(start, last);
        const availableSlots = [];
        for (const slot of allSlots) {
            const slotStartUTC = new Date(`${dateStr}T${slot}:00-05:00`);
            const slotEndUTC = (0, date_fns_1.addMinutes)(slotStartUTC, duration);
            const hasConflict = citas.some((cita) => {
                const inicio = new Date(cita.fechaHora);
                const fin = cita.fechaFin ?? (0, date_fns_1.addMinutes)(inicio, cita.duracionMinutos);
                return slotStartUTC < fin && slotEndUTC > inicio;
            });
            if (!hasConflict)
                availableSlots.push(slot);
        }
        return res.json({ availableSlots });
    }
    catch (error) {
        console.error("❌ ERROR getAvailability:", error);
        return res.status(500).json({ error: "Error interno" });
    }
};
exports.getAvailability = getAvailability;
const createCita = async (req, res) => {
    try {
        const { clienteId, barberoId, servicioId, fechaHora, fechaFin, precioFinal, duracionMinutos, nombreCliente, emailCliente, whatsappCliente, notas, } = req.body;
        if (!barberoId || !fechaHora || !fechaFin) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }
        const isBloqueo = servicioId === BLOQUEO_SERVICE_ID;
        // VALIDAR SIN MANIPULAR TZ
        const inicio = new Date(fechaHora);
        const fin = new Date(fechaFin);
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            return res.status(400).json({
                error: "Fecha inválida",
                details: { fechaHora, fechaFin }
            });
        }
        let duration = duracionMinutos ?? 30;
        if (!isBloqueo) {
            const servicio = await service_1.default.findByPk(servicioId);
            if (!servicio)
                return res.status(404).json({ message: "Servicio no encontrado" });
            duration = servicio.duracion;
        }
        // VALIDACIÓN DE CONFLICTOS
        const conflict = await citas_1.default.findOne({
            where: {
                barberoId,
                fechaHora: { [sequelize_1.Op.lt]: fin },
                fechaFin: { [sequelize_1.Op.gt]: inicio },
                estado: { [sequelize_1.Op.in]: ["pendiente", "confirmada", "bloqueo"] },
            },
        });
        // El admin puede meter citas ENCIMA de un bloqueo
        if (conflict && !isBloqueo && conflict.estado !== "bloqueo") {
            return res.status(409).json({
                message: "El barbero ya tiene un evento en ese horario.",
            });
        }
        const nueva = await citas_1.default.create({
            clienteId: isBloqueo ? null : clienteId,
            barberoId,
            servicioId: isBloqueo ? BLOQUEO_SERVICE_ID : servicioId,
            fechaHora: inicio,
            fechaFin: fin,
            duracionMinutos: duration,
            estado: isBloqueo ? "bloqueo" : "confirmada",
            precioFinal: isBloqueo ? 0 : precioFinal ?? 0,
            nombreCliente: isBloqueo ? null : nombreCliente,
            emailCliente: isBloqueo ? null : emailCliente,
            whatsappCliente: isBloqueo ? null : whatsappCliente,
            notas: notas ?? null,
        });
        return res.status(201).json(nueva);
    }
    catch (error) {
        console.error("❌ ERROR createCita:", error);
        return res.status(500).json({
            error: "Error al crear cita",
            details: error.message,
        });
    }
};
exports.createCita = createCita;
const updateCita = async (req, res) => {
    try {
        const id = req.params.id;
        const { nombreCliente, emailCliente, whatsappCliente, precioFinal, notas, fechaHora, estado, } = req.body;
        const cita = await citas_1.default.findByPk(id);
        if (!cita)
            return res.status(404).json({ message: "Cita no encontrada" });
        let nuevaFechaHoraUTC = cita.fechaHora;
        if (fechaHora) {
            const parsed = new Date(fechaHora);
            if (isNaN(parsed.getTime()))
                return res.status(400).json({ message: "Fecha inválida" });
            nuevaFechaHoraUTC = parsed;
        }
        const nuevaFechaFinUTC = (0, date_fns_1.addMinutes)(nuevaFechaHoraUTC, cita.duracionMinutos);
        // CONFLICTOS (permitimos encima de bloqueos)
        const conflict = await citas_1.default.findOne({
            where: {
                id: { [sequelize_1.Op.ne]: id },
                barberoId: cita.barberoId,
                fechaHora: { [sequelize_1.Op.lt]: nuevaFechaFinUTC },
                fechaFin: { [sequelize_1.Op.gt]: nuevaFechaHoraUTC },
                estado: { [sequelize_1.Op.in]: ["pendiente", "confirmada", "bloqueo"] },
            },
        });
        if (conflict && conflict.estado !== "bloqueo") {
            return res.status(409).json({
                message: "Conflicto: el barbero tiene otra cita en ese horario."
            });
        }
        cita.nombreCliente = nombreCliente ?? cita.nombreCliente;
        cita.emailCliente = emailCliente ?? cita.emailCliente;
        cita.whatsappCliente = whatsappCliente ?? cita.whatsappCliente;
        cita.precioFinal = precioFinal ?? cita.precioFinal;
        cita.notas = notas ?? cita.notas;
        cita.estado = estado ?? cita.estado;
        cita.fechaHora = nuevaFechaHoraUTC;
        cita.fechaFin = nuevaFechaFinUTC;
        await cita.save();
        return res.json({ message: "Cita actualizada", cita });
    }
    catch (error) {
        console.error("❌ ERROR updateCita:", error);
        return res.status(500).json({
            error: "Error actualizando la cita",
            details: error.message,
        });
    }
};
exports.updateCita = updateCita;
const deleteCita = async (req, res) => {
    try {
        const id = req.params.id;
        const cita = await citas_1.default.findByPk(id);
        if (!cita)
            return res.status(404).json({ message: "Cita no encontrada" });
        await cita.destroy();
        return res.json({
            message: "Cita eliminada correctamente",
            id,
        });
    }
    catch (error) {
        console.error("❌ ERROR eliminando cita:", error);
        return res.status(500).json({
            error: "Error eliminando cita",
            details: error.message,
        });
    }
};
exports.deleteCita = deleteCita;
const getCitas = async (_req, res) => {
    try {
        const citas = await citas_1.default.findAll({
            include: [
                {
                    model: service_1.default,
                    as: "servicioCita",
                    attributes: ["id", "nombre", "precio", "duracion"],
                },
                {
                    model: user_1.User,
                    as: "barberoCita",
                    attributes: ["id", "nombre", "apellido", "avatar"],
                },
            ],
            order: [["fechaHora", "ASC"]],
        });
        return res.json(citas);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error obteniendo citas" });
    }
};
exports.getCitas = getCitas;
const getCitaById = async (req, res) => {
    try {
        const cita = await citas_1.default.findByPk(req.params.id);
        if (!cita)
            return res.status(404).json({ message: "Cita no encontrada" });
        return res.json(cita);
    }
    catch (err) {
        return res.status(500).json({ message: "Error obteniendo cita" });
    }
};
exports.getCitaById = getCitaById;
