"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
const allowedOrigins = process.env.FRONTEND_URL?.split(",") || [];
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "../public")));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Origen no permitido por CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
// ---------- RUTAS LIMPIAS ----------
app.use("/auth", auth_routes_1.default); // Login / Register
app.use("/api", index_1.default); // Todo lo demás
// Ruta de prueba
app.get("/", (req, res) => {
    res.send("✅ API de Barbería funcionando!");
});
exports.default = app;
