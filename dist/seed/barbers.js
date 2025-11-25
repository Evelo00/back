"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedBarbers = seedBarbers;
const user_1 = require("../models/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seedBarbers() {
    const password = await bcryptjs_1.default.hash("123456", 10);
    const barberos = [
        { email: "juan@barberia.com", nombre: "Juan", apellido: "Pérez", rol: "barbero", passwordHash: password },
        { email: "carlos@barberia.com", nombre: "Carlos", apellido: "Ramírez", rol: "barbero", passwordHash: password },
        { email: "andres@barberia.com", nombre: "Andrés", apellido: "Gómez", rol: "barbero", passwordHash: password },
        { email: "luis@barberia.com", nombre: "Luis", apellido: "Martínez", rol: "barbero", passwordHash: password },
        { email: "felipe@barberia.com", nombre: "Felipe", apellido: "Torres", rol: "barbero", passwordHash: password },
        { email: "jorge@barberia.com", nombre: "Jorge", apellido: "Castro", rol: "barbero", passwordHash: password },
        { email: "mateo@barberia.com", nombre: "Mateo", apellido: "Hernández", rol: "barbero", passwordHash: password },
    ];
    for (const b of barberos) {
        const [user, created] = await user_1.User.findOrCreate({
            where: { email: b.email },
            defaults: b,
        });
        if (!created) {
            console.log(`El barbero ${b.nombre} ya existe, no se duplicó.`);
        }
    }
    console.log("✅ Barberos revisados y creados correctamente!");
}
// Ejecutar directamente si se corre este archivo
if (require.main === module) {
    (async () => {
        try {
            await seedBarbers();
            process.exit(0);
        }
        catch (err) {
            console.error(err);
            process.exit(1);
        }
    })();
}
