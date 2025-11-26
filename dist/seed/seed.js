"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAll = seedAll;
const database_1 = require("../config/database");
const user_1 = require("../models/user");
const service_1 = __importDefault(require("../models/service"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seedAll() {
    try {
        console.log("🚀 Iniciando seed general...");
        // ----------------------
        // Contraseñas encriptadas
        // ----------------------
        const defaultPassword = await bcryptjs_1.default.hash("123456", 10);
        const superAdminPassword = await bcryptjs_1.default.hash("SuperAdminPassword123", 10);
        // ----------------------
        // ELIMINAR BARBEROS ANTERIORES
        // ----------------------
        console.log("🔥 Eliminando barberos existentes...");
        // Esto eliminará *todos* los usuarios con rol: "barbero"
        await user_1.User.destroy({
            where: { rol: "barbero" },
        });
        console.log("✅ Barberos anteriores eliminados correctamente.");
        // ----------------------
        // Servicios
        // ----------------------
        const services = [
            { nombre: "KIDS ESPECIAL", precio: 30000, duracion: 45 },
            { nombre: "CORTE KIDS", precio: 25000, duracion: 30 },
            { nombre: "CORTE BASICO", precio: 30000, duracion: 30 },
            { nombre: "BARBA", precio: 25000, duracion: 25 },
            { nombre: "BASICO + BARBA", precio: 50000, duracion: 50 },
            { nombre: "FACIAL", precio: 50000, duracion: 40 },
            { nombre: "CORTE BASICO + FACIAL", precio: 80000, duracion: 60 },
            { nombre: "CORTE BASICO + BARBA + FACIAL", precio: 100000, duracion: 80 },
            { nombre: "CEJAS BASICO", precio: 15000, duracion: 15 },
            { nombre: "CEJAS SEMI", precio: 30000, duracion: 20 },
            { nombre: "TINTE BARBA", precio: 40000, duracion: 30 },
            { nombre: "TINTE CABELLO", precio: 60000, duracion: 40 },
            { nombre: "CERA NARIZ", precio: 10000, duracion: 10 },
            { nombre: "CERA OIDOS", precio: 10000, duracion: 10 },
            { nombre: "CERA NARIZ + OIDO", precio: 20000, duracion: 15 },
            { nombre: "BARBA + FACIAL", precio: 75000, duracion: 50 },
            { nombre: "CORTE CON TIJERA", precio: 40000, duracion: 40 },
            { nombre: "CERQUILLOS", precio: 10000, duracion: 10 },
            { nombre: "CORTE TIJERA + FACIAL", precio: 90000, duracion: 70 },
        ];
        for (const s of services) {
            await service_1.default.findOrCreate({
                where: { nombre: s.nombre },
                defaults: s,
            });
        }
        console.log("✅ Servicios cargados correctamente");
        // ----------------------
        // Barberos (Nuevos)
        // ----------------------
        const barberos = [
            { email: "jandy@barberia.com", nombre: "Jandy", apellido: " ", rol: "barbero", passwordHash: defaultPassword },
            { email: "josecarlos@barberia.com", nombre: "José Carlos", apellido: " ", rol: "barbero", passwordHash: defaultPassword },
            { email: "yeiber@barberia.com", nombre: "Yeiber", apellido: " ", rol: "barbero", passwordHash: defaultPassword },
            { email: "johan@barberia.com", nombre: "Johan", apellido: " ", rol: "barbero", passwordHash: defaultPassword },
            { email: "wilber@barberia.com", nombre: "Wilber", apellido: " ", rol: "barbero", passwordHash: defaultPassword },
            { email: "cristianluna@barberia.com", nombre: "Cristian", apellido: " ", rol: "barbero", passwordHash: defaultPassword },
            { email: "jesus@barberia.com", nombre: "Jesús", apellido: " ", rol: "barbero", passwordHash: defaultPassword },
            { email: "camilo@barberia.com", nombre: "Camilo", apellido: " ", rol: "barbero", passwordHash: defaultPassword },
            { email: "cristianacosta@barberia.com", nombre: "Cristian", apellido: " ", rol: "barbero", passwordHash: defaultPassword },
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
        console.log("✅ Barberos cargados correctamente");
        // ----------------------
        // Superadmin
        // ----------------------
        const superAdminData = {
            email: "admin@superbarber.com",
            nombre: "System",
            apellido: "Admin",
            rol: "superadmin",
            passwordHash: superAdminPassword,
        };
        await user_1.User.findOrCreate({
            where: { email: superAdminData.email },
            defaults: superAdminData,
        });
        console.log("✅ Superadmin creado o ya existente");
        // ----------------------
        // Usuarios de prueba (clientes y caja)
        // ----------------------
        const usuarios = [
            // Caja
            { email: "caja@barberia.com", nombre: "Laura", apellido: "Gómez", rol: "caja", passwordHash: defaultPassword, activo: true },
            // Clientes
            { email: "cliente1@example.com", nombre: "Ana", apellido: "Martínez", rol: "cliente", passwordHash: defaultPassword, activo: true },
            { email: "cliente2@example.com", nombre: "Luis", apellido: "Torres", rol: "cliente", passwordHash: defaultPassword, activo: true },
        ];
        for (const u of usuarios) {
            await user_1.User.findOrCreate({
                where: { email: u.email },
                defaults: u,
            });
        }
        console.log("✅ Usuarios de prueba cargados correctamente");
        console.log("🎉 Seed general completado!");
    }
    catch (error) {
        console.error("❌ Error en seed general:", error);
    }
    finally {
        await database_1.sequelize.close();
    }
}
// Ejecutar directamente si se llama desde la terminal
if (require.main === module) {
    seedAll();
}
