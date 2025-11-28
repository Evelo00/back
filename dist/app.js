"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const index_1 = __importDefault(require("./routes/index"));
// Inicializar app
const app = (0, express_1.default)();
// Cargar orígenes permitidos
const allowedOrigins = process.env.FRONTEND_URL?.split(",") || [];
// Middlewares principales
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Archivos públicos
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "../public")));
// ------------- CORS FLEXIBLE Y SEGURO -------------
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir mobile (sin origin)
        if (!origin)
            return callback(null, true);
        // Normalizar (evitar https/http duplicados)
        const cleanOrigin = origin.replace(/\/$/, "");
        const isAllowed = allowedOrigins.some((o) => cleanOrigin.includes(o.replace(/\/$/, "")));
        if (isAllowed)
            return callback(null, true);
        return callback(new Error(`CORS: Origen no permitido: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// ------------- HELMET PARA API / SOCKETS -------------
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
}));
// Logs de peticiones
app.use((0, morgan_1.default)("dev"));
// ------------- RUTAS -------------
app.use("/auth", auth_routes_1.default);
app.use("/api", index_1.default);
app.get("/", (_req, res) => {
    res.send("✅ API de Barbería funcionando!");
});
exports.default = app;
