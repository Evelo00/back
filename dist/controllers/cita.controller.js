"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCita = exports.getCitaById = exports.getCitas = exports.updateCita = exports.createCita = exports.buscarClientes = exports.getAvailability = void 0;
const citas_1 = __importDefault(require("../models/citas"));
const cliente_1 = __importDefault(require("../models/cliente"));
const user_1 = require("../models/user");
const sequelize_1 = require("sequelize");
const service_1 = __importDefault(require("../models/service"));
const citaServicio_1 = __importDefault(require("../models/citaServicio"));
const schedule_1 = require("../utils/schedule");
const date_1 = require("../utils/date");
const date_fns_1 = require("date-fns");
const BLOQUEO_SERVICE_ID = "00000000-0000-0000-0000-000000000999";
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
        const { date, barberoId, sedeId, serviceDuration } = req.query;
        const duration = Number(serviceDuration);
        if (!duration || isNaN(duration) || duration <= 0) {
            return res.status(400).json({ message: "Duración inválida" });
        }
        if (!date || !barberoId || !sedeId) {
            return res.status(400).json({ message: "Faltan parámetros requeridos" });
        }
        const dateStr = String(date);
        const dayStartUTC = new Date(`${dateStr}T00:00:00-05:00`);
        const dayEndUTC = new Date(`${dateStr}T23:59:59-05:00`);
        const citas = await citas_1.default.findAll({
            where: {
                barberoId: String(barberoId),
                sedeId: String(sedeId),
                estado: { [sequelize_1.Op.in]: ["confirmada", "pendiente", "bloqueo"] },
                // 👇 clave: SOLO citas que cruzan el día
                fechaHora: { [sequelize_1.Op.lt]: dayEndUTC },
                fechaFin: { [sequelize_1.Op.gt]: dayStartUTC },
            },
        });
        const bloqueoDiaCompleto = citas.some((cita) => cita.servicioId === BLOQUEO_SERVICE_ID &&
            cita.fechaHora <= dayStartUTC &&
            cita.fechaFin >= dayEndUTC);
        if (bloqueoDiaCompleto) {
            return res.json({ availableSlots: [] });
        }
        const dayBogota = new Date(`${dateStr}T00:00:00-05:00`);
        const { start, lastSlot, realEnd } = (0, schedule_1.getDaySchedule)(dayBogota);
        const allSlots = generateTimeSlots(start, lastSlot);
        const cierreUTC = new Date(`${dateStr}T${realEnd}:00-05:00`);
        const availableSlots = [];
        for (const slot of allSlots) {
            const slotStartUTC = new Date(`${dateStr}T${slot}:00-05:00`);
            // ⛔ No permitir iniciar después del cierre
            if (slotStartUTC >= cierreUTC)
                continue;
            const slotEndUTC = (0, date_fns_1.addMinutes)(slotStartUTC, duration);
            const hasConflict = citas.some((cita) => {
                const inicioReal = cita.fechaHora < dayStartUTC
                    ? dayStartUTC
                    : cita.fechaHora;
                const finReal = cita.fechaFin > dayEndUTC
                    ? dayEndUTC
                    : cita.fechaFin;
                // 🔥 comparación REAL de intervalos
                return (slotStartUTC < finReal &&
                    slotEndUTC > inicioReal);
            });
            if (!hasConflict) {
                availableSlots.push(slot);
            }
        }
        return res.json({ availableSlots });
    }
    catch (error) {
        console.error("❌ ERROR getAvailability:", error);
        return res.status(500).json({ error: "Error interno" });
    }
};
exports.getAvailability = getAvailability;
const buscarClientes = async (req, res) => {
    try {
        const q = String(req.query.q || "").trim();
        if (q.length < 2)
            return res.json([]);
        const clientes = await cliente_1.default.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { nombre: { [sequelize_1.Op.iLike]: `%${q}%` } },
                    { telefono: { [sequelize_1.Op.iLike]: `%${q}%` } },
                ],
            },
            limit: 10,
            raw: true,
        }).then((rows) => rows.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            telefono: c.telefono,
            email: c.email,
            source: "clientes",
        })));
        const citas = await citas_1.default.findAll({
            attributes: [
                [(0, sequelize_1.literal)(`DISTINCT ON ("whatsapp_cliente") "nombre_cliente"`), "nombre"],
                ["whatsapp_cliente", "telefono"],
                ["email_cliente", "email"],
            ],
            where: {
                whatsappCliente: { [sequelize_1.Op.not]: null },
                nombreCliente: { [sequelize_1.Op.not]: null },
                [sequelize_1.Op.or]: [
                    { nombreCliente: { [sequelize_1.Op.iLike]: `%${q}%` } },
                    { whatsappCliente: { [sequelize_1.Op.iLike]: `%${q}%` } },
                ],
            },
            order: [
                ["whatsappCliente", "ASC"],
                ["createdAt", "DESC"],
            ],
            limit: 10,
            raw: true,
        }).then((rows) => rows.map((c) => ({
            nombre: c.nombre,
            telefono: c.telefono,
            email: c.email,
            source: "citas",
        })));
        const map = new Map();
        clientes.forEach((c) => map.set(c.telefono, c));
        citas.forEach((c) => {
            if (!map.has(c.telefono))
                map.set(c.telefono, c);
        });
        return res.json([...map.values()]);
    }
    catch (error) {
        console.error("❌ ERROR buscarClientes:", error);
        return res.status(500).json({ message: "Error buscando clientes" });
    }
};
exports.buscarClientes = buscarClientes;
const createCita = async (req, res) => {
    try {
        const { clienteId, barberoId, servicios, fechaHora, nombreCliente, emailCliente, whatsappCliente, notas, servicioId, fechaFin, duracionMinutos, sedeId, } = req.body;
        if (!barberoId || !fechaHora) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }
        const inicio = new Date(fechaHora); // YA viene con -05:00
        if (isNaN(inicio.getTime())) {
            return res.status(400).json({ message: "fechaHora inválida" });
        }
        // si hay req.user → admin
        const isAdmin = Boolean(req.user && ["admin", "superadmin"].includes(req.user.rol));
        if (servicioId === BLOQUEO_SERVICE_ID) {
            if (!isAdmin) {
                return res.status(403).json({ message: "No autorizado" });
            }
            if (!fechaFin) {
                return res.status(400).json({ message: "fechaFin requerida para bloqueo" });
            }
            const finBloqueo = new Date(fechaFin);
            const bloqueo = await citas_1.default.create({
                sedeId,
                clienteId: null,
                barberoId,
                servicioId: BLOQUEO_SERVICE_ID,
                fechaHora: inicio,
                fechaFin: finBloqueo,
                duracionMinutos: duracionMinutos ?? 30,
                estado: "bloqueo",
                precioFinal: 0,
                nombreCliente: null,
                emailCliente: null,
                whatsappCliente: null,
                notas: notas ?? null,
            });
            return res.status(201).json(bloqueo);
        }
        if (!Array.isArray(servicios) || servicios.length === 0) {
            return res.status(400).json({
                message: "Debe seleccionar al menos un servicio.",
            });
        }
        const foundServices = await service_1.default.findAll({
            where: { id: servicios },
        });
        if (foundServices.length !== servicios.length) {
            return res.status(400).json({ message: "Servicio inválido." });
        }
        const totalDuracion = foundServices.reduce((sum, s) => sum + s.duracion, 0);
        const totalPrecio = foundServices.reduce((sum, s) => sum + s.precio, 0);
        const fin = (0, date_fns_1.addMinutes)(inicio, totalDuracion);
        const conflict = await citas_1.default.findOne({
            where: {
                barberoId,
                sedeId,
                fechaHora: { [sequelize_1.Op.lt]: fin },
                fechaFin: { [sequelize_1.Op.gt]: inicio },
                estado: { [sequelize_1.Op.in]: ["pendiente", "confirmada", "bloqueo"] },
            },
        });
        // ❌ Cliente: nunca puede sobreescribir
        // ✅ Admin: sí puede
        if (conflict && !isAdmin) {
            return res.status(409).json({
                message: "El barbero ya tiene una cita o bloqueo en ese horario",
            });
        }
        const nuevaCita = await citas_1.default.create({
            sedeId,
            clienteId: isAdmin ? clienteId ?? null : null,
            barberoId,
            fechaHora: inicio,
            fechaFin: fin,
            duracionMinutos: totalDuracion,
            precioFinal: totalPrecio,
            estado: "confirmada",
            nombreCliente: nombreCliente?.trim() || null,
            emailCliente: emailCliente?.trim() || null,
            whatsappCliente: whatsappCliente?.trim() || null,
            notas: conflict && isAdmin
                ? `⚠️ Cita forzada por admin sobre cita ${conflict.id}`
                : notas ?? null,
        });
        await citaServicio_1.default.bulkCreate(foundServices.map((s) => ({
            citaId: nuevaCita.id,
            servicioId: s.id,
            precio: s.precio,
            duracion: s.duracion,
        })));
        return res.status(201).json({
            message: "Cita creada correctamente",
            cita: nuevaCita,
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
        const id = req.params.id;
        const { nombreCliente, emailCliente, whatsappCliente, fechaHora, notas, precioFinal, servicios = [], } = req.body;
        /* =========================
           BUSCAR CITA
        ========================= */
        const cita = await citas_1.default.findByPk(id, {
            include: [{ model: citaServicio_1.default, as: "servicios" }],
        });
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }
        /* =========================
           FECHA INICIO
        ========================= */
        const inicio = new Date(fechaHora);
        if (isNaN(inicio.getTime())) {
            return res.status(400).json({ message: "fechaHora inválida" });
        }
        /* =========================
           VALIDAR SERVICIOS
        ========================= */
        if (!Array.isArray(servicios) || servicios.length === 0) {
            return res.status(400).json({
                message: "La cita debe tener al menos un servicio",
            });
        }
        /* =========================
           DURACIÓN REAL (ÚNICA FUENTE)
        ========================= */
        const totalDuracion = servicios.reduce((sum, s) => sum + Number(s.duracion), 0);
        if (totalDuracion <= 0) {
            return res.status(400).json({
                message: "Duración total inválida",
            });
        }
        const fin = (0, date_fns_1.addMinutes)(inicio, totalDuracion);
        /* =========================
           UPDATE CITA
        ========================= */
        await cita.update({
            nombreCliente: nombreCliente?.trim() || null,
            emailCliente: emailCliente?.trim() || null,
            whatsappCliente: whatsappCliente?.trim() || null,
            fechaHora: inicio,
            fechaFin: fin,
            duracionMinutos: totalDuracion, // 🔒 clave
            notas: notas ?? null,
            precioFinal,
        });
        /* =========================
           REEMPLAZAR SERVICIOS
        ========================= */
        await citaServicio_1.default.destroy({ where: { citaId: id } });
        await citaServicio_1.default.bulkCreate(servicios.map((s) => ({
            citaId: id,
            servicioId: s.servicioId,
            precio: Number(s.precio),
            duracion: Number(s.duracion),
        })));
        /* =========================
           RESPUESTA
        ========================= */
        const updated = await citas_1.default.findByPk(id, {
            include: [
                {
                    model: citaServicio_1.default,
                    as: "servicios",
                    include: [{ model: service_1.default, as: "servicio" }],
                },
            ],
        });
        return res.json({
            message: "Cita actualizada correctamente",
            cita: updated,
        });
    }
    catch (error) {
        console.error("❌ ERROR updateCita:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Error interno",
        });
    }
};
exports.updateCita = updateCita;
const getCitas = async (req, res) => {
    try {
        const { sedeId, week } = req.query;
        if (!week) {
            return res.status(400).json({ message: "Debe enviar la fecha de la semana" });
        }
        const baseBogota = new Date(`${week}T00:00:00`);
        const startBogota = (0, date_fns_1.startOfWeek)(baseBogota, { weekStartsOn: 1 });
        startBogota.setHours(0, 0, 0, 0);
        const endBogota = (0, date_fns_1.endOfWeek)(baseBogota, { weekStartsOn: 1 });
        endBogota.setHours(23, 59, 59, 999);
        const startWeek = (0, date_1.bogotaToUTC)(startBogota);
        const endWeek = (0, date_1.bogotaToUTC)(endBogota);
        const includeBarbero = {
            model: user_1.User,
            as: "barberoCita",
            attributes: ["id", "nombre", "apellido", "avatar", "sedeId"],
        };
        if (sedeId)
            includeBarbero.where = { sedeId };
        const citas = await citas_1.default.findAll({
            attributes: [
                "id",
                "fechaHora",
                "fechaFin",
                "estado",
                "barberoId",
                "sedeId",
                "duracionMinutos",
                "nombreCliente",
                "emailCliente",
                "whatsappCliente",
            ],
            where: {
                fechaHora: {
                    [sequelize_1.Op.between]: [startWeek, endWeek],
                },
            },
            include: [
                includeBarbero,
                {
                    model: citaServicio_1.default,
                    as: "servicios",
                    include: [
                        {
                            model: service_1.default,
                            as: "servicio",
                            attributes: ["id", "nombre", "precio", "duracion"],
                        },
                    ],
                },
            ],
            order: [["fechaHora", "ASC"]],
        });
        return res.json(citas);
    }
    catch (err) {
        console.error("❌ ERROR getCitas:", err);
        return res.status(500).json({ message: "Error obteniendo citas" });
    }
};
exports.getCitas = getCitas;
const getCitaById = async (req, res) => {
    try {
        const id = req.params.id;
        const cita = await citas_1.default.findByPk(id, {
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
