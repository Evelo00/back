"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAppointmentReminder = sendAppointmentReminder;
const twilio_1 = __importDefault(require("twilio"));
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
/**
 * Envía un recordatorio de WhatsApp 30 minutos antes de la cita
 * @param toPhone - Número del cliente con código de país, ej: +573001234567
 * @param data - Datos de la reserva
 */
async function sendAppointmentReminder(toPhone, data) {
    try {
        // Validar que el número tenga formato correcto
        if (!toPhone || !toPhone.startsWith("+")) {
            console.warn(`⚠️ Número inválido: ${toPhone}`);
            return null;
        }
        const { clientName, date, barberName, services, totalPrice } = data;
        // Formatear fecha y hora en español
        const fechaFormateada = (0, date_fns_1.format)(date, "EEEE, d 'de' MMMM", { locale: locale_1.es });
        const horaFormateada = (0, date_fns_1.format)(date, "h:mm a", { locale: locale_1.es });
        const serviciosTexto = services.join(", ");
        const message = `🔔 ¡Recordatorio! ${clientName}

Tu cita es en 30 minutos:

📅 Hoy, ${fechaFormateada}
⏰ Hora: ${horaFormateada}
✂️ Barbero: ${barberName}
🎯 Servicios: ${serviciosTexto}
💰 Total: $${totalPrice.toLocaleString("es-CO")}

Te esperamos. ¡No llegues tarde! 😊`;
        const response = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: `whatsapp:${toPhone}`,
            body: message,
        });
        console.log(`✅ Recordatorio enviado a ${toPhone} - SID: ${response.sid}`);
        return response.sid;
    }
    catch (error) {
        console.error(`❌ Error enviando recordatorio a ${toPhone}:`, error.message);
        return null;
    }
}
