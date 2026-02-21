"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startReminderCron = startReminderCron;
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const citas_1 = __importDefault(require("../models/citas"));
const user_1 = require("../models/user");
const service_1 = __importDefault(require("../models/service"));
const citaServicio_1 = __importDefault(require("../models/citaServicio"));
const whatsappService_1 = require("./whatsappService");
const date_fns_1 = require("date-fns");
/**
 * Busca citas que inicien en 30 minutos y envía recordatorios
 */
async function checkAndSendReminders() {
    try {
        const now = new Date();
        // Ventana de tiempo: citas que empiecen entre 25 y 35 minutos desde ahora
        // (para dar margen si el cron se ejecuta con pequeño delay)
        const targetTime = (0, date_fns_1.addMinutes)(now, 30);
        const windowStart = (0, date_fns_1.subMinutes)(targetTime, 5); // 25 min
        const windowEnd = (0, date_fns_1.addMinutes)(targetTime, 5); // 35 min
        console.log(`🔍 Buscando citas entre ${windowStart.toISOString()} y ${windowEnd.toISOString()}`);
        const citasPendientes = await citas_1.default.findAll({
            where: {
                fechaHora: {
                    [sequelize_1.Op.between]: [windowStart, windowEnd],
                },
                estado: { [sequelize_1.Op.in]: ["confirmada", "pendiente"] },
                recordatorioEnviado: false,
                // Solo citas con WhatsApp registrado
                whatsappCliente: { [sequelize_1.Op.not]: null },
            },
            include: [
                {
                    model: user_1.User,
                    as: "barberoCita",
                    attributes: ["nombre", "apellido"],
                },
                {
                    model: citaServicio_1.default,
                    as: "servicios",
                    include: [
                        {
                            model: service_1.default,
                            as: "servicio",
                            attributes: ["nombre"],
                        },
                    ],
                },
            ],
        });
        console.log(`📋 Encontradas ${citasPendientes.length} citas para recordatorio`);
        for (const cita of citasPendientes) {
            try {
                const barber = cita.barberoCita;
                // const servicios = (cita.servicios as any[]).map((cs: any) => cs.servicio.nombre);
                const servicios = (cita.servicios || []).map((cs) => cs.servicio.nombre);
                // Intentar obtener teléfono del cliente (desde User si existe)
                let phoneNumber = cita.whatsappCliente;
                if (!phoneNumber && cita.clienteId) {
                    const cliente = await user_1.User.findByPk(cita.clienteId, {
                        attributes: ["telefono"],
                    });
                    phoneNumber = cliente?.telefono || null;
                }
                if (!phoneNumber) {
                    console.warn(`⚠️ Cita ${cita.id}: sin teléfono registrado`);
                    continue;
                }
                // Enviar recordatorio
                const sid = await (0, whatsappService_1.sendAppointmentReminder)(phoneNumber, {
                    clientName: cita.nombreCliente || "Cliente",
                    date: cita.fechaHora,
                    barberName: `${barber.nombre} ${barber.apellido}`,
                    services: servicios,
                    totalPrice: cita.precioFinal,
                });
                if (sid) {
                    // Marcar como enviado
                    await cita.update({
                        recordatorioEnviado: true,
                        recordatorioEnviadoAt: new Date(),
                    });
                    console.log(`✅ Recordatorio enviado para cita ${cita.id}`);
                }
            }
            catch (error) {
                console.error(`❌ Error procesando cita ${cita.id}:`, error.message);
                // Continuar con las siguientes citas
            }
        }
        console.log(`✅ Proceso de recordatorios completado`);
    }
    catch (error) {
        console.error("❌ Error en checkAndSendReminders:", error.message);
    }
}
/**
 * Inicia el cron job que se ejecuta cada 5 minutos
 */
function startReminderCron() {
    // Ejecutar cada 5 minutos
    node_cron_1.default.schedule("*/5 * * * *", async () => {
        console.log("⏰ Ejecutando cron de recordatorios...");
        await checkAndSendReminders();
    });
    console.log("✅ Cron de recordatorios iniciado (cada 5 minutos)");
    // Ejecutar una vez al inicio para testing
    checkAndSendReminders();
}
