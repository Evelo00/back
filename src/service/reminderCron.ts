import cron from "node-cron";
import { Op } from "sequelize";
import Cita from "../models/citas";
import { User } from "../models/user";
import Service from "../models/service";
import CitaServicio from "../models/citaServicio";
import { sendAppointmentReminder } from "./whatsappService";
import { addMinutes, subMinutes } from "date-fns";

async function checkAndSendReminders() {
  try {
    const now = new Date();
    
    // Ventana de tiempo: citas que empiecen entre 25 y 35 minutos desde ahora
    // (para dar margen si el cron se ejecuta con pequeño delay)
    const targetTime = addMinutes(now, 30);
    const windowStart = subMinutes(targetTime, 5);
    const windowEnd = addMinutes(targetTime, 5);

    console.log(`🔍 Buscando citas entre ${windowStart.toISOString()} y ${windowEnd.toISOString()}`);

    const citasPendientes = await Cita.findAll({
      where: {
        fechaHora: {
          [Op.between]: [windowStart, windowEnd],
        },
        estado: { [Op.in]: ["confirmada", "pendiente"] },
        recordatorioEnviado: false,
        // Solo citas con WhatsApp registrado
        whatsappCliente: { [Op.not]: null },
      },
      include: [
        {
          model: User,
          as: "barberoCita",
          attributes: ["nombre", "apellido"],
        },
        {
          model: CitaServicio,
          as: "servicios",
          include: [
            {
              model: Service,
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
        const barber = cita.barberoCita as any;
        // const servicios = (cita.servicios as any[]).map((cs: any) => cs.servicio.nombre);
        const servicios = ((cita as any).servicios || []).map((cs: any) => cs.servicio.nombre);

        // Intentar obtener teléfono del cliente (desde User si existe)
        let phoneNumber = cita.whatsappCliente;

        if (!phoneNumber && cita.clienteId) {
          const cliente = await User.findByPk(cita.clienteId, {
            attributes: ["telefono"],
          });
          phoneNumber = cliente?.telefono || null;
        }

        if (!phoneNumber) {
          console.warn(`⚠️ Cita ${cita.id}: sin teléfono registrado`);
          continue;
        }

        // Enviar recordatorio
        const sid = await sendAppointmentReminder(phoneNumber, {
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
      } catch (error: any) {
        console.error(`❌ Error procesando cita ${cita.id}:`, error.message);
      }
    }

    console.log(`✅ Proceso de recordatorios completado`);
  } catch (error: any) {
    console.error("❌ Error en checkAndSendReminders:", error.message);
  }
}

export function startReminderCron() {
  // Ejecutar cada 5 minutos
  cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ Ejecutando cron de recordatorios...");
    await checkAndSendReminders();
  });

  console.log("✅ Cron de recordatorios iniciado (cada 5 minutos)");
  
  // Ejecutar una vez al inicio para testing
  checkAndSendReminders();
}