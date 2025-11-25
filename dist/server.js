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
const APP_PORT = Number(process.env.PORT) || 80;
const HOST = "0.0.0.0";
const server = (0, http_1.createServer)(app_1.default);
(0, socket_1.initSocket)(server);
console.log("cosa ->", {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD
});
(0, database_1.connectDB)()
    .then(() => {
    database_1.sequelize
        .sync({ force: false })
        .then(async () => {
        await (0, create_superadmin_1.createSuperAdmin)();
        console.log("✅ Modelos sincronizados con la base de datos.");
        server.listen(APP_PORT, HOST, () => {
            console.log(`🚀 Servidor corriendo en http://${HOST}:${APP_PORT}`);
        });
    })
        .catch((err) => {
        console.error("❌ Error al sincronizar modelos:", err);
        process.exit(1);
    });
})
    .catch((err) => {
    console.error("❌ Error al conectar a la base de datos:", err);
    process.exit(1);
});
