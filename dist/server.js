"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config();
}
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./websocket/socket");
const database_1 = require("./config/database");
const create_superadmin_1 = require("./seed/create-superadmin");
const APP_PORT = Number(process.env.PORT) || Number(process.env.APP_PORT);
const HOST = "0.0.0.0";
const server = (0, http_1.createServer)(app_1.default);
(0, socket_1.initSocket)(server);
console.log("ENV ->", {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
});
const startServer = () => {
    server.listen(APP_PORT, HOST, () => {
        console.log(`🚀 Servidor corriendo en http://${HOST}:${APP_PORT}`);
    });
};
(0, database_1.connectDB)()
    .then(() => {
    database_1.sequelize
        .sync({ force: false })
        .then(async () => {
        await (0, create_superadmin_1.createSuperAdmin)();
        console.log("✅ Modelos sincronizados con la base de datos.");
        startServer(); // Inicia el servidor después de la sincronización exitosa
    })
        .catch((err) => {
        console.error("❌ Error al sincronizar modelos o en seeds:", err);
        // Si la conexión funcionó pero la sincronización/seeds falló, es un error grave.
        process.exit(1);
    });
})
    .catch((err) => {
    console.error("❌ Error al conectar a la base de datos. Iniciando sin conexión a DB:", err);
    // 🔑 CAMBIO CLAVE: Llama a startServer() si la conexión a la DB falla.
    // Esto resuelve el 502 Bad Gateway de Seenode. Las rutas de la API que
    // dependan de la DB fallarán con error 500, pero el servicio estará "up".
    startServer();
});
