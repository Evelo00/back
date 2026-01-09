"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaySchedule = getDaySchedule;
function getDaySchedule(date) {
    const day = date.getDay(); // 0 = domingo
    // Domingo: 9 a 7
    if (day === 0) {
        return {
            start: "09:00",
            lastSlot: "18:30",
            realEnd: "19:00",
        };
    }
    // Lunes a sábado: 8 a 8
    return {
        start: "08:00",
        lastSlot: "19:30",
        realEnd: "20:00",
    };
}
