import { Router } from "express";
import {
  createCita,
  getCitas,
  getCitaById,
  updateCita,
  deleteCita,
  getAvailability,
  buscarClientes,
} from "../controllers/cita.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// user

router.get("/availability", getAvailability);
router.get("/clientes/buscar", buscarClientes);

// cliente normal
router.post("/public", createCita);

// Admin

router.post("/", authMiddleware, createCita);

router.get("/", authMiddleware, getCitas);

router.get("/:id", authMiddleware, getCitaById);

router.put("/:id", authMiddleware, updateCita);

router.delete("/:id", authMiddleware, deleteCita);

export default router;
