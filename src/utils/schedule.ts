export type DaySchedule = {
  start: string;      // apertura
  lastSlot: string;  // último slot donde puede INICIAR una cita
  realEnd: string;   // cierre real
};

export function getDaySchedule(date: Date): DaySchedule {
  const day = date.getDay(); // 0 = domingo

  // Domingo: 9 a 7
  if (day === 0) {
    return {
      start: "09:00",
      lastSlot: "18:45",
      realEnd: "19:00",
    };
  }

  // Lunes a sábado: 8 a 8
  return {
    start: "08:00",
    lastSlot: "19:45",
    realEnd: "20:00",
  };
}
