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
const SHOP_OPEN = "09:00";
const SHOP_CLOSE = "21:00";
const generateTimeSlots = (start, end, duration, interval = 30) => {
    const slots = [];
    let current = (0, date_fns_1.parseISO)(`2000-01-01T${start}:00`);
    const endTime = (0, date_fns_1.parseISO)(`2000-01-01T${end}:00`);
    while (current < endTime) {
        const potentialEnd = (0, date_fns_1.addMinutes)(current, duration);
        if (potentialEnd <= endTime) {
            slots.push((0, date_fns_1.format)(current, "HH:mm"));
        }
        current = (0, date_fns_1.addMinutes)(current, interval);
    }
    return slots;
};
const getAvailability = async (req, res) => {
    try {
        const { date, serviceDuration } = req.query;
        let barberoId = req.query.barberoId;
        if (Array.isArray(barberoId))
            barberoId = barberoId[0];
        if (!date || !serviceDuration || !barberoId) {
            return res.status(400).json({ message: "Faltan parámetros requeridos" });
        }
        const durationMinutes = parseInt(serviceDuration, 10);
        const dateStr = String(date);
        // BOGOTÁ LOCAL
        const dayStartBogota = new Date(`${dateStr}T00:00:00-05:00`);
        const dayEndBogota = new Date(`${dateStr}T23:59:59-05:00`);
        // Convertir a UTC
        const startUTC = new Date(dayStartBogota.getTime() + 5 * 3600 * 1000);
        const endUTC = new Date(dayEndBogota.getTime() + 5 * 3600 * 1000);
        const citas = await citas_1.default.findAll({
            where: {
                barberoId,
                fechaHora: { [sequelize_1.Op.between]: [startUTC, endUTC] },
            },
        });
        const allSlots = generateTimeSlots(SHOP_OPEN, SHOP_CLOSE, durationMinutes);
        const availableSlots = [];
        for (const slot of allSlots) {
            const slotStartUTC = new Date(`${dateStr}T${slot}:00-05:00`);
            const slotEndUTC = (0, date_fns_1.addMinutes)(slotStartUTC, durationMinutes);
            const hasConflict = citas.some((cita) => {
                const citaStartUTC = new Date(cita.fechaHora);
                const citaEndUTC = cita.fechaFin ?? (0, date_fns_1.addMinutes)(citaStartUTC, cita.duracionMinutos);
                return slotStartUTC < citaEndUTC && slotEndUTC > citaStartUTC;
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
        const { clienteId, barberoId, servicioId, fechaHora, precioFinal, nombreCliente, emailCliente, whatsappCliente, notas, } = req.body;
        if (!barberoId || !servicioId || !fechaHora) {
            return res.status(400).json({
                message: "Faltan campos requeridos",
            });
        }
        // 🔥 Duración REAL del servicio
        const servicio = await service_1.default.findByPk(servicioId);
        const duration = servicio?.duracion && servicio.duracion > 0
            ? Number(servicio.duracion)
            : 30;
        console.log("⏱ duración usada (min):", duration);
        // Fecha ya viene en UTC desde el front
        const fechaInicioUTC = new Date(fechaHora);
        const fechaFinUTC = (0, date_fns_1.addMinutes)(fechaInicioUTC, duration);
        // 🔥 Solapamiento
        const conflict = await citas_1.default.findOne({
            where: {
                barberoId,
                estado: { [sequelize_1.Op.in]: ["pendiente", "confirmada"] },
                fechaHora: { [sequelize_1.Op.lt]: fechaFinUTC },
                fechaFin: { [sequelize_1.Op.gt]: fechaInicioUTC },
            },
        });
        if (conflict) {
            console.log("❌ SOLAPAMIENTO DETECTADO:");
            console.log("   → cita inicio:", conflict.fechaHora);
            console.log("   → cita fin   :", conflict.fechaFin);
            console.log("   → slot inicio:", fechaInicioUTC);
            console.log("   → slot fin   :", fechaFinUTC);
            return res.status(409).json({
                message: "El barbero ya tiene una cita en ese horario.",
            });
        }
        const nueva = await citas_1.default.create({
            clienteId: clienteId || null,
            barberoId,
            servicioId,
            fechaHora: fechaInicioUTC,
            fechaFin: fechaFinUTC,
            estado: "confirmada",
            precioFinal: precioFinal ?? 0,
            duracionMinutos: duration,
            nombreCliente,
            emailCliente,
            whatsappCliente,
            notas,
        });
        return res.status(201).json(nueva);
    }
    catch (error) {
        console.error("❌ ERROR createCita:", error);
        return res
            .status(400)
            .json({ error: "Error al crear cita", details: error.message });
    }
};
exports.createCita = createCita;
const updateCita = async (req, res) => {
    try {
        const cita = await citas_1.default.findByPk(req.params.id);
        if (!cita)
            return res.status(404).json({ error: "Cita no encontrada" });
        const { fechaHora, duracionMinutos, ...rest } = req.body;
        const updates = rest;
        if (fechaHora || duracionMinutos) {
            const nuevaFechaUTC = fechaHora
                ? new Date(fechaHora)
                : new Date(cita.fechaHora);
            const newDuration = duracionMinutos ?? cita.duracionMinutos ?? 30;
            updates.fechaHora = nuevaFechaUTC;
            updates.duracionMinutos = newDuration;
            updates.fechaFin = (0, date_fns_1.addMinutes)(nuevaFechaUTC, newDuration);
            const conflict = await citas_1.default.findOne({
                where: {
                    barberoId: cita.barberoId,
                    estado: { [sequelize_1.Op.in]: ["pendiente", "confirmada"] },
                    id: { [sequelize_1.Op.ne]: cita.id },
                    fechaHora: { [sequelize_1.Op.lt]: updates.fechaFin },
                    fechaFin: { [sequelize_1.Op.gt]: updates.fechaHora },
                },
            });
            if (conflict) {
                return res.status(409).json({
                    message: "La actualización se solapa con otra cita.",
                });
            }
        }
        await cita.update(updates);
        return res.json(cita);
    }
    catch (error) {
        return res.status(400).json({ error: "Error al actualizar cita", details: error });
    }
};
exports.updateCita = updateCita;
const deleteCita = async (req, res) => {
    try {
        const cita = await citas_1.default.findByPk(req.params.id);
        if (!cita)
            return res.status(404).json({ error: "Cita no encontrada" });
        await cita.destroy();
        return res.json({ message: "Cita eliminada correctamente" });
    }
    catch (error) {
        return res.status(500).json({ error: "Error al eliminar cita", details: error });
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
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }
        return res.json(cita);
    }
    catch (err) {
        return res.status(500).json({ message: "Error obteniendo cita" });
    }
};
exports.getCitaById = getCitaById;
