"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = __importDefault(require("./user.routes"));
const sede_routes_1 = __importDefault(require("./sede.routes"));
const service_routes_1 = __importDefault(require("./service.routes"));
const cita_routes_1 = __importDefault(require("./cita.routes"));
const clientes_routes_1 = __importDefault(require("./clientes.routes"));
const superAdmin_routes_1 = __importDefault(require("./superAdmin.routes"));
const seed_routes_1 = __importDefault(require("./seed.routes"));
const router = (0, express_1.Router)();
router.use("/users", user_routes_1.default);
router.use("/services", service_routes_1.default);
router.use("/sedes", sede_routes_1.default);
router.use("/citas", cita_routes_1.default);
router.use("/clientes", clientes_routes_1.default);
router.use("/superadmin", superAdmin_routes_1.default);
if (process.env.NODE_ENV !== "production") {
    router.use("/seed", seed_routes_1.default);
}
router.use((_req, res) => {
    res.status(404).json({
        status: 404,
        message: "Ruta no encontrada en la API de Barbería",
    });
});
exports.default = router;
