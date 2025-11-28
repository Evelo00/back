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
const BLOQUEO_SERVICE_ID = "00000000-0000-0000-0000-000000000999";
const bogotaToUTC = (dateStr) => {
    const local = new Date(dateStr); // interpreta -05:00 correctamente
    return new Date(local.getTime() + 5 * 3600 * 1000);
};
const generateTimeSlots = (start, end, duration, interval = 15) => {
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
// export const getAvailability = async (req: Request, res: Response) => {
//   try {
//     const { date, serviceDuration } = req.query;
//     let barberoId = req.query.barberoId;
//     if (Array.isArray(barberoId)) barberoId = barberoId[0];
//     if (!date || !serviceDuration || !barberoId) {
//       return res.status(400).json({ message: "Faltan parámetros requeridos" });
//     }
//     const dateStr = String(date);
//     const durationMinutes = parseInt(serviceDuration as string, 10);
//     const dayStartBog = `${dateStr}T00:00:00-05:00`;
//     const dayEndBog = `${dateStr}T23:59:59-05:00`;
//     const startUTC = bogotaToUTC(dayStartBog);
//     const endUTC = bogotaToUTC(dayEndBog);
//     const citas = await Cita.findAll({
//       where: {
//         barberoId,
//         fechaHora: { [Op.between]: [startUTC, endUTC] },
//       },
//     });
//     const allSlots = generateTimeSlots(SHOP_OPEN, SHOP_CLOSE, durationMinutes);
//     const availableSlots: string[] = [];
//     for (const slot of allSlots) {
//       const localSlot = `${dateStr}T${slot}:00-05:00`;
//       const slotStartUTC = bogotaToUTC(localSlot);
//       const slotEndUTC = addMinutes(slotStartUTC, durationMinutes);
//       const hasConflict = citas.some((cita) => {
//         const start = new Date(cita.fechaHora);
//         const end = cita.fechaFin ?? addMinutes(start, cita.duracionMinutos);
//         return slotStartUTC < end && slotEndUTC > start;
//       });
//       if (!hasConflict) availableSlots.push(slot);
//     }
//     return res.json({ availableSlots });
//   } catch (error) {
//     console.error("❌ ERROR getAvailability:", error);
//     return res.status(500).json({ error: "Error interno" });
//   }
// };
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
        // 👉 Fechas del día en Bogotá sin convertir manualmente
        const startUTC = new Date(`${dateStr}T00:00:00-05:00`);
        const endUTC = new Date(`${dateStr}T23:59:59-05:00`);
        const citas = await citas_1.default.findAll({
            where: {
                barberoId,
                fechaHora: { [sequelize_1.Op.between]: [startUTC, endUTC] },
            },
        });
        const allSlots = generateTimeSlots(SHOP_OPEN, SHOP_CLOSE, durationMinutes);
        const availableSlots = [];
        for (const slot of allSlots) {
            // 👉 Slot local en Bogotá sin convertir manualmente
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
// export const createCita = async (req: Request, res: Response) => {
//   try {
//     const {
//       clienteId,
//       barberoId,
//       servicioId,
//       fechaHora,    // YA VIENE COMO UTC DESDE EL FRONT (toISOString())
//       precioFinal,
//       duracionMinutos,
//       nombreCliente,
//       emailCliente,
//       whatsappCliente,
//       notas,
//     } = req.body;
//     if (!barberoId || !fechaHora) {
//       return res.status(400).json({ message: "Faltan campos requeridos" });
//     }
//     const isBloqueo = servicioId === BLOQUEO_SERVICE_ID;
//     let duration: number = 30;
//     if (isBloqueo) {
//       duration = duracionMinutos ?? 30;
//     } else {
//       const servicio = await Service.findByPk(servicioId);
//       if (!servicio)
//         return res.status(404).json({ message: "Servicio no encontrado" });
//       duration = servicio.duracion;
//     }
//     const fechaInicioUTC = new Date(fechaHora);
//     const fechaFinUTC = addMinutes(fechaInicioUTC, duration);
//     const conflict = await Cita.findOne({
//       where: {
//         barberoId,
//         estado: { [Op.in]: ["pendiente", "confirmada", "bloqueo"] },
//         fechaHora: { [Op.lt]: fechaFinUTC },
//         fechaFin: { [Op.gt]: fechaInicioUTC },
//       },
//     });
//     if (conflict) {
//       return res.status(409).json({
//         message: "El barbero ya tiene un evento en ese horario.",
//       });
//     }
//     const nueva = await Cita.create({
//       clienteId: isBloqueo ? null : clienteId,
//       barberoId,
//       servicioId: isBloqueo ? BLOQUEO_SERVICE_ID : servicioId,
//       fechaHora: fechaInicioUTC,
//       fechaFin: fechaFinUTC,
//       estado: isBloqueo ? "bloqueo" : "confirmada",
//       precioFinal: isBloqueo ? 0 : precioFinal ?? 0,
//       duracionMinutos: duration,
//       nombreCliente: isBloqueo ? null : nombreCliente,
//       emailCliente: isBloqueo ? null : emailCliente,
//       whatsappCliente: isBloqueo ? null : whatsappCliente,
//       notas: notas ?? null,
//     });
//     return res.status(201).json(nueva);
//   } catch (error: any) {
//     console.error("❌ ERROR createCita:", error);
//     return res.status(500).json({
//       error: "Error al crear cita",
//       details: error.message,
//     });
//   }
// };
const createCita = async (req, res) => {
    try {
        const { clienteId, barberoId, servicioId, fechaHora, // AHORA VIENE COMO: 2025-11-28T11:30:00-05:00
        precioFinal, duracionMinutos, nombreCliente, emailCliente, whatsappCliente, notas, } = req.body;
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
        // 👉 NO convertir nada manualmente
        // 👉 Esto interpreta correctamente el -05:00 y genera UTC interno
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
            fechaHora: fechaInicio, // Sequelize lo guarda en UTC
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
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }
        let nuevaFechaHoraUTC = cita.fechaHora;
        if (fechaHora) {
            const parsed = new Date(fechaHora);
            if (isNaN(parsed.getTime())) {
                return res.status(400).json({ message: "Fecha inválida" });
            }
            // 👉 Usamos la fecha tal cual viene con zona horaria (-05:00)
            nuevaFechaHoraUTC = parsed;
        }
        const nuevaFechaFinUTC = (0, date_fns_1.addMinutes)(nuevaFechaHoraUTC, cita.duracionMinutos);
        const conflict = await citas_1.default.findOne({
            where: {
                id: { [sequelize_1.Op.ne]: id },
                barberoId: cita.barberoId,
                estado: { [sequelize_1.Op.in]: ["pendiente", "confirmada", "bloqueo"] },
                fechaHora: { [sequelize_1.Op.lt]: nuevaFechaFinUTC },
                fechaFin: { [sequelize_1.Op.gt]: nuevaFechaHoraUTC }
            }
        });
        if (conflict) {
            return res
                .status(409)
                .json({ message: "Conflicto: el barbero tiene otra cita en ese horario." });
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
// export const updateCita = async (req: Request, res: Response) => {
//   try {
//     const id = req.params.id;
//     const {
//       nombreCliente,
//       emailCliente,
//       whatsappCliente,
//       precioFinal,
//       notas,
//       fechaHora,
//       estado
//     } = req.body;
//     const cita = await Cita.findByPk(id);
//     if (!cita) {
//       return res.status(404).json({ message: "Cita no encontrada" });
//     }
//     let nuevaFechaHoraUTC = cita.fechaHora;
//     if (fechaHora) {
//       const fechaParsed = new Date(fechaHora);
//       if (isNaN(fechaParsed.getTime())) {
//         return res.status(400).json({ message: "Fecha inválida" });
//       }
//       fechaParsed.setMinutes(fechaParsed.getMinutes() - fechaParsed.getTimezoneOffset());
//       nuevaFechaHoraUTC = fechaParsed;
//     }
//     const nuevaFechaFinUTC = addMinutes(
//       nuevaFechaHoraUTC,
//       cita.duracionMinutos
//     );
//     const conflict = await Cita.findOne({
//       where: {
//         id: { [Op.ne]: id }, // excluir actual
//         barberoId: cita.barberoId,
//         estado: { [Op.in]: ["pendiente", "confirmada", "bloqueo"] },
//         fechaHora: { [Op.lt]: nuevaFechaFinUTC },
//         fechaFin: { [Op.gt]: nuevaFechaHoraUTC }
//       }
//     });
//     if (conflict) {
//       return res
//         .status(409)
//         .json({ message: "Conflicto: el barbero tiene otra cita en ese horario." });
//     }
//     cita.nombreCliente = nombreCliente ?? cita.nombreCliente;
//     cita.emailCliente = emailCliente ?? cita.emailCliente;
//     cita.whatsappCliente = whatsappCliente ?? cita.whatsappCliente;
//     cita.precioFinal = precioFinal ?? cita.precioFinal;
//     cita.notas = notas ?? cita.notas;
//     cita.estado = estado ?? cita.estado;
//     cita.fechaHora = nuevaFechaHoraUTC;
//     cita.fechaFin = nuevaFechaFinUTC;
//     await cita.save();
//     return res.json({ message: "Cita actualizada", cita });
//   } catch (error: any) {
//     console.error("❌ ERROR updateCita:", error);
//     return res.status(500).json({
//       error: "Error actualizando la cita",
//       details: error.message,
//     });
//   }
// };
const deleteCita = async (req, res) => {
    try {
        const id = req.params.id;
        const cita = await citas_1.default.findByPk(id);
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada" });
        }
        await cita.destroy();
        return res.json({
            message: "Cita eliminada correctamente",
            id
        });
    }
    catch (error) {
        console.error("❌ ERROR eliminando cita:", error);
        return res.status(500).json({
            error: "Error eliminando la cita",
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
