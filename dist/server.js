"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const socket_1 = require("./websocket/socket");
const create_superadmin_1 = require("./seed/create-superadmin");
const PORT = Number(process.env.PORT) || 4000;
const HOST = "0.0.0.0";
// Crear servidor HTTP
const server = (0, http_1.createServer)(app_1.default);
// Inicializar WebSockets DESPUÉS de crear server
(0, socket_1.initSocket)(server);
// ---------- Manejo global de errores ----------
process.on("uncaughtException", (err) => {
    console.error("❌ Error no capturado:", err);
});
process.on("unhandledRejection", (reason) => {
    console.error("❌ Promesa rechazada no manejada:", reason);
});
// ---------- Iniciar servidor ----------
const startHTTP = () => {
    server.listen(PORT, HOST, () => {
        console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
    });
};
(0, database_1.connectDB)()
    .then(async () => {
    try {
        await database_1.sequelize.sync({ alter: false });
        await (0, create_superadmin_1.createSuperAdmin)();
        console.log("✅ Modelos sincronizados correctamente.");
        startHTTP();
    }
    catch (syncErr) {
        console.error("❌ Error al sincronizar modelos:", syncErr);
        startHTTP(); // Mantener servicio arriba
    }
})
    .catch((dbErr) => {
    console.error("❌ Error conectando a DB:", dbErr);
    startHTTP(); // El servidor sigue arriba aunque DB falle
});
