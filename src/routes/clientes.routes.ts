import { Router } from "express";
import {
  createCliente,
  getClientes,
  buscarClientes,
} from "../controllers/clientes.controller";

const router = Router();

router.post("/", createCliente);
router.get("/", getClientes);

router.get("/buscar", buscarClientes);

export default router;
