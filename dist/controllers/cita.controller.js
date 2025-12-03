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
function getDaySchedule(dateStr) {
    const day = new Date(dateStr).getDay();
    if (day === 0) {
        return { start: "10:00", last: "18:30" }; // 30 min antes de 19:00
    }
    if (day >= 1 && day <= 4) {
        return { start: "08:00", last: "19:30" }; // 30 min antes de 20:00
    }
    if (day === 5 || day === 6) {
        return { start: "08:00", last: "20:30" }; // 30 min antes de 21:00
    }
    return { start: "08:00", last: "20:30" };
}
const generateTimeSlots = (start, end, duration, interval = 15) => {
    const slots = [];
    let current = (0, date_fns_1.parseISO)(`2000-01-01T${start}:00`);
    const [endHour, endMinute] = end.split(":").map(Number);
    const endLimit = (0, date_fns_1.parseISO)(`2000-01-01T${end}:00`);
    while (current <= endLimit) {
        const hh = current.getHours();
        const mm = current.getMinutes();
        // 🔥 Validación corregida
        if (hh < endHour || (hh === endHour && mm <= endMinute)) {
            slots.push((0, date_fns_1.format)(current, "HH:mm"));
        }
        current = (0, date_fns_1.addMinutes)(current, interval);
    }
    return slots;
};
const BLOQUEO_SERVICE_ID = "00000000-0000-0000-0000-000000000999";
const getAvailability = async (req, res) => {
    try {
        const { date, serviceDuration } = req.query;
        let barberoId = req.query.barberoId;
        if (Array.isArray(barberoId))
            barberoId = barberoId[0];
        if (!date || !serviceDuration || !barberoId) {
            return res.status(400).json({ message: "Faltan parámetros requeridos" });
        }
        const dateStr = String(date);
        const durationMinutes = parseInt(serviceDuration, 10);
        const startUTC = new Date(`${dateStr}T00:00:00-05:00`);
        const endUTC = new Date(`${dateStr}T23:59:59-05:00`);
        const citas = await citas_1.default.findAll({
            where: {
                barberoId,
                fechaHora: { [sequelize_1.Op.between]: [startUTC, endUTC] },
            },
        });
        const { start, last } = getDaySchedule(dateStr);
        const allSlots = generateTimeSlots(start, last, durationMinutes);
        const availableSlots = [];
        for (const slot of allSlots) {
            const slotStartUTC = new Date(`${dateStr}T${slot}:00-05:00`);
            const slotEndUTC = (0, date_fns_1.addMinutes)(slotStartUTC, durationMinutes);
            const hasConflict = citas.some((cita) => {
                const start = new Date(cita.fechaHora);
                const end = cita.fechaFin ?? (0, date_fns_1.addMinutes)(start, cita.duracionMinutos);
                return slotStartUTC < end && slotEndUTC > start;
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
        const { clienteId, barberoId, servicioId, fechaHora, precioFinal, duracionMinutos, nombreCliente, emailCliente, whatsappCliente, notas, } = req.body;
        if (!barberoId || !fechaHora) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }
        const isBloqueo = servicioId === BLOQUEO_SERVICE_ID;
        let duration = 30;
        if (isBloqueo) {
            duration = duracionMinutos ?? 30;
        }
        else {
            const servicio = await service_1.default.findByPk(servicioId);
            if (!servicio)
                return res.status(404).json({ message: "Servicio no encontrado" });
            duration = servicio.duracion;
        }
        const fechaInicio = new Date(fechaHora);
        const fechaFin = (0, date_fns_1.addMinutes)(fechaInicio, duration);
        const conflict = await citas_1.default.findOne({
            where: {
                barberoId,
                estado: { [sequelize_1.Op.in]: ["pendiente", "confirmada", "bloqueo"] },
                fechaHora: { [sequelize_1.Op.lt]: fechaFin },
                fechaFin: { [sequelize_1.Op.gt]: fechaInicio },
            },
        });
        if (conflict) {
            return res.status(409).json({
                message: "El barbero ya tiene un evento en ese horario.",
            });
        }
        const nueva = await citas_1.default.create({
            clienteId: isBloqueo ? null : clienteId,
            barberoId,
            servicioId: isBloqueo ? BLOQUEO_SERVICE_ID : servicioId,
            fechaHora: fechaInicio,
            fechaFin: fechaFin,
            estado: isBloqueo ? "bloqueo" : "confirmada",
            precioFinal: isBloqueo ? 0 : precioFinal ?? 0,
            duracionMinutos: duration,
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
        const { nombreCliente, emailCliente, whatsappCliente, precioFinal, notas, fechaHora, estado } = req.body;
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
        const conflict = await citas_1.default.findOne({
            where: {
                id: { [sequelize_1.Op.ne]: id },
                barberoId: cita.barberoId,
                estado: { [sequelize_1.Op.in]: ["pendiente", "confirmada", "bloqueo"] },
                fechaHora: { [sequelize_1.Op.lt]: nuevaFechaFinUTC },
                fechaFin: { [sequelize_1.Op.gt]: nuevaFechaHoraUTC },
            },
        });
        if (conflict) {
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
            id
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
