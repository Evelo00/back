"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCita = exports.updateCita = exports.createCita = exports.getCitaById = exports.getCitas = exports.getAvailability = void 0;
const citas_1 = __importDefault(require("../models/citas"));
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const date_fns_1 = require("date-fns");
const generateTimeSlots = (start, end, duration, interval = 20) => {
    const slots = [];
    let current = (0, date_fns_1.parseISO)(`2000-01-01T${start}:00`);
    const endTime = (0, date_fns_1.parseISO)(`2000-01-01T${end}:00`);
    while (current < endTime) {
        const potentialEnd = (0, date_fns_1.addMinutes)(current, duration);
        if (potentialEnd <= endTime) {
            slots.push((0, date_fns_1.format)(current, 'HH:mm'));
        }
        current = (0, date_fns_1.addMinutes)(current, interval);
    }
    return slots;
};
const getAvailability = async (req, res) => {
    try {
        const { date, serviceDuration, barberId } = req.query;
        if (!date || !serviceDuration) {
            return res.status(400).json({ message: "Faltan parámetros requeridos (date, serviceDuration)" });
        }
        const SHOP_OPEN = '09:00';
        const SHOP_CLOSE = '21:00';
        const durationMinutes = parseInt(serviceDuration, 10);
        // Utilizamos new Date() para parsear la fecha (ej: '2025-11-27')
        const targetDate = new Date(date);
        // 🔍 LOGGING DE ENTRADA
        console.log(`🔍 getAvailability Input: Date=${date}, Duration=${durationMinutes}, BarberId=${barberId}`);
        let targetBarberIds = [];
        if (barberId && barberId !== 'any') {
            targetBarberIds = [barberId];
        }
        else {
            // Si es 'any' o no se proporciona, busca todos los barberos activos
            const allBarbers = await models_1.User.findAll({ where: { rol: 'barbero', activo: true } });
            targetBarberIds = allBarbers.map(b => b.id);
        }
        if (targetBarberIds.length === 0) {
            return res.json({ availableSlots: [] });
        }
        const startOfDayDate = (0, date_fns_1.startOfDay)(targetDate);
        const endOfDayDate = (0, date_fns_1.addMinutes)(startOfDayDate, 24 * 60);
        // 🔍 LOGGING DE RANGO DE CONSULTA
        console.log(`DB Query Range: ${startOfDayDate.toISOString()} to ${endOfDayDate.toISOString()}`);
        console.log(`Target Barber IDs: ${targetBarberIds.join(', ')}`);
        const existingAppointments = await citas_1.default.findAll({
            // FIX: Excluimos la columna "fechaFin" que no existe en la DB
            attributes: ['id', 'barberoId', 'fechaHora', 'duracionMinutos', 'estado'],
            where: {
                barberoId: { [sequelize_1.Op.in]: targetBarberIds },
                estado: { [sequelize_1.Op.in]: ['pendiente', 'confirmada'] },
                fechaHora: {
                    [sequelize_1.Op.between]: [startOfDayDate, endOfDayDate]
                }
            },
            order: [['fechaHora', 'ASC']]
        });
        const allPossibleSlots = generateTimeSlots(SHOP_OPEN, SHOP_CLOSE, durationMinutes);
        const appointmentsByBarber = {};
        targetBarberIds.forEach(id => appointmentsByBarber[id] = []);
        existingAppointments.forEach(cita => {
            if (cita.barberoId)
                appointmentsByBarber[cita.barberoId]?.push(cita);
        });
        const freeSlots = [];
        for (const slotTime of allPossibleSlots) {
            // Recrea el objeto Date completo para el slot
            const slotStart = (0, date_fns_1.parseISO)(`${(0, date_fns_1.format)(targetDate, 'yyyy-MM-dd')}T${slotTime}:00`);
            const slotEnd = (0, date_fns_1.addMinutes)(slotStart, durationMinutes);
            let isAvailable = false;
            for (const barberId of targetBarberIds) {
                const barberAppointments = appointmentsByBarber[barberId];
                const isBarberFree = !barberAppointments.some(cita => {
                    // Aseguramos que fechaHora sea un objeto Date
                    const appointmentStart = new Date(cita.fechaHora);
                    // Usamos 30 como valor por defecto si duracionMinutos es null/undefined
                    const duration = cita.duracionMinutos || 30;
                    const appointmentEnd = (0, date_fns_1.addMinutes)(appointmentStart, duration);
                    // Conflicto: slot nuevo comienza antes de que termine la cita existente
                    // O el slot nuevo termina después de que empieza la cita existente.
                    return slotStart < appointmentEnd && slotEnd > appointmentStart;
                });
                if (isBarberFree) {
                    isAvailable = true;
                    break;
                }
            }
            if (isAvailable) {
                freeSlots.push(slotTime);
            }
        }
        return res.json({ availableSlots: freeSlots });
    }
    catch (error) {
        console.error("❌ ERROR getAvailability:", error);
        // 🔑 Ahora capturamos y logueamos el objeto de error completo para obtener detalles de Sequelize/DB
        console.error("❌ Full Error Object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return res.status(500).json({ message: "Error al calcular la disponibilidad", details: error.message });
    }
};
exports.getAvailability = getAvailability;
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
        const { clienteId, barberoId, servicioId, fechaHora, precioFinal, duracionMinutos, nombreCliente, emailCliente, whatsappCliente, notas } = req.body;
        if (!barberoId || !servicioId || !fechaHora) {
            return res.status(400).json({
                message: "Faltan campos obligatorios: barberoId, servicioId, fechaHora"
            });
        }
        const startDate = new Date(fechaHora);
        const duration = duracionMinutos ?? 30;
        // 🔥 CALCULAR fechaFin
        const fechaFin = (0, date_fns_1.addMinutes)(startDate, duration);
        // 🔥 AHORA SI GUARDAMOS fechaFin
        const nueva = await citas_1.default.create({
            clienteId: clienteId || null,
            barberoId,
            servicioId,
            fechaHora: startDate,
            fechaFin,
            estado: "confirmada",
            precioFinal: precioFinal ?? 0,
            duracionMinutos: duration,
            nombreCliente,
            emailCliente,
            whatsappCliente,
            notas
        });
        return res.status(201).json(nueva);
    }
    catch (error) {
        console.error("❌ ERROR createCita:", error);
        const sequelizeErrors = error.errors?.map((e) => ({
            message: e.message,
            path: e.path,
            value: e.value
        }));
        return res.status(400).json({
            error: "Error al crear cita",
            details: error.message,
            sequelizeErrors: sequelizeErrors || undefined
        });
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
