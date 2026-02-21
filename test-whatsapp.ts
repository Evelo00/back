import dotenv from 'dotenv';
dotenv.config();

import { sendAppointmentReminder } from './src/service/whatsappService';

// ⚠️ CAMBIA ESTE NÚMERO POR EL TUYO (el que usaste para hacer join)
const miNumero = '+573116308815'; // ← TU NÚMERO AQUÍ

sendAppointmentReminder(miNumero, {
  clientName: 'Eyver Vergara',
  date: new Date(Date.now() + 30 * 60 * 1000), // 30 min desde ahora
  barberName: 'Luis Martínez',
  services: ['Corte clásico', 'Barba'],
  totalPrice: 35000
})
.then(sid => {
  if (sid) {
    console.log('✅ Recordatorio enviado! SID:', sid);
  } else {
    console.log('⚠️ No se pudo enviar (revisa el número)');
  }
})
.catch(err => console.error('❌ Error:', err.message));