"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCitaById = exports.getCitas = exports.deleteCita = exports.updateCita = exports.createCita = exports.getAvailability = void 0;
const citas_1 = __importDefault(require("../models/citas"));
const sequelize_1 = require("sequelize");
const date_fns_1 = require("date-fns");
const colombiaToUTC = (iso) => {
    const [datePart, timePart] = iso.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    // Colombia = UTC-5 → para convertir a UTC: sumar 5 horas
    return new Date(Date.UTC(year, month - 1, day, hour + 5, minute, 0));
};
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
            return res.status(400).json({
                message: "Faltan parámetros requeridos",
            });
        }
        const durationMinutes = parseInt(serviceDuration, 10);
        // Interpretar fecha YYYY-MM-DD como COL (00:00 COL)
        const dateStartUTC = colombiaToUTC(date + "T00:00:00");
        const startUTC = (0, date_fns_1.startOfDay)(dateStartUTC);
        const endUTC = (0, date_fns_1.endOfDay)(dateStartUTC);
        // Buscar citas guardadas en UTC dentro del día
        const citas = await citas_1.default.findAll({
            where: {
                barberoId,
                fechaHora: { [sequelize_1.Op.between]: [startUTC, endUTC] },
            },
        });
        const SHOP_OPEN = "09:00";
        const SHOP_CLOSE = "21:00";
        const allSlots = generateTimeSlots(SHOP_OPEN, SHOP_CLOSE, durationMinutes);
        const availableSlots = [];
        for (const slot of allSlots) {
            const [h, m] = slot.split(":").map(Number);
            // Slot en COL
            const slotCOL = new Date(dateStartUTC.getUTCFullYear(), dateStartUTC.getUTCMonth(), dateStartUTC.getUTCDate(), h, m, 0);
            // Convertir slot COL → UTC
            const slotUTC = colombiaToUTC(`${(0, date_fns_1.format)(slotCOL, "yyyy-MM-dd")}T${slot}`);
            const slotEndUTC = (0, date_fns_1.addMinutes)(slotUTC, durationMinutes);
            // Comparar contra citas guardadas en UTC
            const hasConflict = citas.some((cita) => {
                const citaStartUTC = new Date(cita.fechaHora);
                const citaEndUTC = cita.fechaFin
                    ? new Date(cita.fechaFin)
                    : new Date(citaStartUTC.getTime() + cita.duracionMinutos * 60000);
                return slotUTC < citaEndUTC && slotEndUTC > citaStartUTC;
            });
            if (!hasConflict)
                availableSlots.push(slot);
        }
        return res.json({ availableSlots });
    }
    catch (error) {
        console.error("❌ ERROR getAvailability:", error);
        return res.status(500).json({ error: "Error interno", details: String(error) });
    }
};
exports.getAvailability = getAvailability;
const createCita = async (req, res) => {
    try {
        const { clienteId, barberoId, servicioId, fechaHora, precioFinal, duracionMinutos, nombreCliente, emailCliente, whatsappCliente, notas, } = req.body;
        if (!barberoId || !servicioId || !fechaHora) {
            return res.status(400).json({
                message: "Faltan campos requeridos",
            });
        }
        const duration = duracionMinutos ?? 30;
        // Convertir hora COL enviada desde el front → UTC real
        const fechaInicioUTC = colombiaToUTC(fechaHora);
        const fechaFinUTC = (0, date_fns_1.addMinutes)(fechaInicioUTC, duration);
        const conflict = await citas_1.default.findOne({
            where: {
                barberoId,
                estado: { [sequelize_1.Op.in]: ["pendiente", "confirmada"] },
                fechaHora: { [sequelize_1.Op.lt]: fechaFinUTC },
                fechaFin: { [sequelize_1.Op.gt]: fechaInicioUTC },
            },
        });
        if (conflict) {
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
    catch (e) {
        console.error("❌ ERROR createCita:", e);
        return res.status(400).json({ error: "Error al crear cita", details: e.message });
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
            const newStartDate = fechaHora
                ? colombiaToUTC(fechaHora) // Correcta interpretación
                : new Date(cita.fechaHora); // Ya está en UTC
            const newDuration = duracionMinutos ?? cita.duracionMinutos ?? 30;
            updates.fechaHora = newStartDate;
            updates.duracionMinutos = newDuration;
            updates.fechaFin = (0, date_fns_1.addMinutes)(newStartDate, newDuration);
            const conflictAppointment = await citas_1.default.findOne({
                where: {
                    barberoId: cita.barberoId,
                    estado: { [sequelize_1.Op.in]: ["pendiente", "confirmada"] },
                    id: { [sequelize_1.Op.ne]: cita.id },
                    fechaHora: { [sequelize_1.Op.lt]: updates.fechaFin },
                    fechaFin: { [sequelize_1.Op.gt]: updates.fechaHora },
                },
            });
            if (conflictAppointment) {
                return res.status(409).json({
                    message: "La actualización de la cita se solapa con una cita existente.",
                });
            }
        }
        await cita.update(updates);
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
const getCitas = async (req, res) => {
    try {
        const citas = await citas_1.default.findAll();
        return res.json(citas);
    }
    catch (err) {
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
