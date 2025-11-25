"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const superAdmin_controller_1 = require("../controllers/superAdmin.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.use((0, role_middleware_1.requireRole)("superadmin"));
//  * GET /api/superadmin/citas
router.get("/citas", superAdmin_controller_1.obtenerTodasLasCitas);
//  * GET /api/superadmin/users
router.get("/users", superAdmin_controller_1.obtenerTodosLosUsuarios);
//  * POST /api/superadmin/users
router.post("/users", superAdmin_controller_1.crearUsuario);
//  * PUT /api/superadmin/users/:id
router.put("/users/:id", superAdmin_controller_1.actualizarUsuario);
exports.default = router;
