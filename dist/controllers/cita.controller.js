"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCita = exports.getCitaById = exports.getCitas = exports.updateCita = exports.createCita = exports.getAvailability = void 0;
const citas_1 = __importDefault(require("../models/citas"));
const user_1 = require("../models/user");
const sequelize_1 = require("sequelize");
const service_1 = __importDefault(require("../models/service"));
const citaServicio_1 = __importDefault(require("../models/citaServicio"));
const date_fns_1 = require("date-fns");
const BLOQUEO_SERVICE_ID = "00000000-0000-0000-0000-000000000999";
function getDaySchedule(dateStr) {
    const [year, month, dayNum] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, dayNum);
    const day = date.getDay();
    if (day === 0)
        return { start: "10:00", last: "18:30" };
    if (day >= 1 && day <= 4)
        return { start: "08:00", last: "19:30" };
    if (day === 5 || day === 6)
        return { start: "08:00", last: "20:30" };
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
        if (!date || !serviceDuration || !barberoId)
            return res.status(400).json({ message: "Faltan parámetros requeridos" });
        const dateStr = String(date);
        const duration = parseInt(serviceDuration, 10);
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
        const { clienteId, barberoId, servicios, fechaHora, fechaFin, duracionMinutos, nombreCliente, emailCliente, whatsappCliente, notas, servicioId, } = req.body;
        if (!barberoId || !fechaHora)
            return res.status(400).json({ message: "Faltan campos requeridos" });
        const inicio = new Date(fechaHora);
        if (isNaN(inicio.getTime()))
            return res.status(400).json({ message: "fechaHora inválida" });
        const isBloqueo = servicioId === BLOQUEO_SERVICE_ID;
        if (isBloqueo) {
            const fin = new Date(fechaFin);
            const nueva = await citas_1.default.create({
                clienteId: null,
                barberoId,
                servicioId: BLOQUEO_SERVICE_ID,
                fechaHora: inicio,
                fechaFin: fin,
                duracionMinutos: duracionMinutos ?? 30,
                estado: "bloqueo",
                precioFinal: 0,
                nombreCliente: null,
                emailCliente: null,
                whatsappCliente: null,
                notas: notas ?? null,
            });
            return res.status(201).json(nueva);
        }
        if (!Array.isArray(servicios) || servicios.length === 0) {
            return res.status(400).json({ message: "Debe seleccionar al menos un servicio." });
        }
        const found = await service_1.default.findAll({ where: { id: servicios } });
        if (found.length !== servicios.length)
            return res.status(400).json({ message: "Servicio inválido." });
        const totalDuracion = found.reduce((sum, s) => sum + s.duracion, 0);
        const totalPrecio = found.reduce((sum, s) => sum + s.precio, 0);
        const fin = (0, date_fns_1.addMinutes)(inicio, totalDuracion);
        const conflict = await citas_1.default.findOne({
            where: {
                barberoId,
                fechaHora: { [sequelize_1.Op.lt]: fin },
                fechaFin: { [sequelize_1.Op.gt]: inicio },
                estado: { [sequelize_1.Op.in]: ["pendiente", "confirmada", "bloqueo"] },
            },
        });
        if (conflict) {
            return res.status(409).json({
                message: "El barbero ya tiene una cita o bloqueo en ese horario",
            });
        }
        const nuevaCita = await citas_1.default.create({
            clienteId,
            barberoId,
            servicioId: null,
            fechaHora: inicio,
            fechaFin: fin,
            duracionMinutos: totalDuracion,
            precioFinal: totalPrecio,
            estado: "confirmada",
            nombreCliente,
            emailCliente,
            whatsappCliente,
            notas: notas ?? null,
        });
        await citaServicio_1.default.bulkCreate(found.map((s) => ({
            citaId: nuevaCita.id,
            servicioId: s.id,
            precio: s.precio,
            duracion: s.duracion,
        })));
        return res.status(201).json({
            message: "Cita creada con múltiples servicios",
            cita: nuevaCita,
            servicios: found,
        });
    }
    catch (error) {
        console.error("❌ ERROR createCita:", error);
        return res.status(500).json({ error: error.message });
    }
};
exports.createCita = createCita;
const updateCita = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombreCliente, emailCliente, whatsappCliente, fechaHora, notas, precioFinal, duracionMinutos, servicios = [] } = req.body;
        const cita = await citas_1.default.findByPk(id, {
            include: [{ model: citaServicio_1.default, as: "servicios" }],
        });
        if (!cita)
            return res.status(404).json({ message: "Cita no encontrada" });
        await cita.update({
            nombreCliente,
            emailCliente,
            whatsappCliente,
            fechaHora,
            notas,
            precioFinal,
            duracionMinutos
        });
        await citaServicio_1.default.destroy({ where: { citaId: id } });
        for (const s of servicios) {
            if (!s.servicioId)
                throw new Error("Servicio recibido sin servicioId");
            await citaServicio_1.default.create({
                citaId: id,
                servicioId: s.servicioId,
                precio: Number(s.precio),
                duracion: Number(s.duracion),
            });
        }
        const updated = await citas_1.default.findByPk(id, {
            include: [
                {
                    model: citaServicio_1.default,
                    as: "servicios",
                    include: [{ model: service_1.default, as: "servicio" }],
                },
            ],
        });
        return res.json({ message: "Cita actualizada", cita: updated });
    }
    catch (err) {
        console.error("❌ Error UPDATE CITA:", err);
        res.status(500).json({ error: err instanceof Error ? err.message : "Error desconocido" });
    }
};
exports.updateCita = updateCita;
const getCitas = async (_req, res) => {
    try {
        const citas = await citas_1.default.findAll({
            include: [
                {
                    model: citaServicio_1.default,
                    as: "servicios",
                    include: [{ model: service_1.default, as: "servicio" }],
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
        const cita = await citas_1.default.findByPk(req.params.id, {
            include: [
                {
                    model: citaServicio_1.default,
                    as: "servicios",
                    include: [{ model: service_1.default, as: "servicio" }],
                },
                {
                    model: user_1.User,
                    as: "barberoCita",
                    attributes: ["id", "nombre", "apellido", "avatar"],
                },
            ],
        });
        if (!cita)
            return res.status(404).json({ message: "Cita no encontrada" });
        return res.json(cita);
    }
    catch (err) {
        return res.status(500).json({ message: "Error obteniendo cita" });
    }
};
exports.getCitaById = getCitaById;
const deleteCita = async (req, res) => {
    try {
        const id = req.params.id;
        await citaServicio_1.default.destroy({ where: { citaId: id } });
        const cita = await citas_1.default.findByPk(id);
        if (!cita)
            return res.status(404).json({ message: "Cita no encontrada" });
        await cita.destroy();
        return res.json({ message: "Cita eliminada correctamente", id });
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
