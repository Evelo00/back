"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientes_controller_1 = require("../controllers/clientes.controller");
const router = (0, express_1.Router)();
router.post("/", clientes_controller_1.createCliente);
router.get("/", clientes_controller_1.getClientes);
router.get("/buscar", clientes_controller_1.buscarClientes);
exports.default = router;
