"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cita_controller_1 = require("../controllers/cita.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/* =========================
   🔓 RUTAS PÚBLICAS
========================= */
router.get("/availability", cita_controller_1.getAvailability);
router.get("/clientes/buscar", cita_controller_1.buscarClientes);
// cliente normal
router.post("/public", cita_controller_1.createCita);
/* =========================
   🔒 RUTAS ADMIN
========================= */
// crear cita / bloqueo
router.post("/", auth_middleware_1.authMiddleware, cita_controller_1.createCita);
// listar citas
router.get("/", auth_middleware_1.authMiddleware, cita_controller_1.getCitas);
// obtener una cita
router.get("/:id", auth_middleware_1.authMiddleware, cita_controller_1.getCitaById);
// actualizar cita
router.put("/:id", auth_middleware_1.authMiddleware, cita_controller_1.updateCita);
// eliminar cita
router.delete("/:id", auth_middleware_1.authMiddleware, cita_controller_1.deleteCita);
exports.default = router;
