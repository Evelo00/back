import twilio from "twilio";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface ReminderData {
  clientName: string;
  date: Date;
  barberName: string;
  services: string[];
  totalPrice: number;
}

/**
 * Envía un recordatorio de WhatsApp 30 minutos antes de la cita
 * @param toPhone - Número del cliente con código de país, ej: +573001234567
 * @param data - Datos de la reserva
 */
export async function sendAppointmentReminder(
  toPhone: string,
  data: ReminderData
): Promise<string | null> {
  try {
    // Validar que el número tenga formato correcto
    if (!toPhone || !toPhone.startsWith("+")) {
      console.warn(`⚠️ Número inválido: ${toPhone}`);
      return null;
    }

    const { clientName, date, barberName, services, totalPrice } = data;

    const fechaFormateada = format(date, "EEEE, d 'de' MMMM", { locale: es });
    const horaFormateada = format(date, "h:mm a", { locale: es });

    const serviciosTexto = services.join(", ");

    const message = `🔔 ¡Este es un Recordatorio! 
    
      Que tal, ${clientName}

      Tu cita es en 30 minutos:

      📅 Hoy, ${fechaFormateada}
      ⏰ Hora: ${horaFormateada}
      ✂️ Barbero: ${barberName}
      🎯 Servicios: ${serviciosTexto}
      💰 Total: $${totalPrice.toLocaleString("es-CO")}

      Te esperamos. ¡No llegues tarde! 😊
      
      Si no puedes llegar, por favor escribenos`;

    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${toPhone}`,
      body: message,
    });

    console.log(`✅ Recordatorio enviado a ${toPhone} - SID: ${response.sid}`);
    return response.sid;
  } catch (error: any) {
    console.error(`❌ Error enviando recordatorio a ${toPhone}:`, error.message);
    return null;
  }
}