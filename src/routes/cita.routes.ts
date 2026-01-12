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

/* =========================
   🔓 RUTAS PÚBLICAS
========================= */

router.get("/availability", getAvailability);
router.get("/clientes/buscar", buscarClientes);

// cliente normal
router.post("/public", createCita);

/* =========================
   🔒 RUTAS ADMIN
========================= */

// crear cita / bloqueo
router.post("/", authMiddleware, createCita);

// listar citas
router.get("/", authMiddleware, getCitas);

// obtener una cita
router.get("/:id", authMiddleware, getCitaById);

// actualizar cita
router.put("/:id", authMiddleware, updateCita);

// eliminar cita
router.delete("/:id", authMiddleware, deleteCita);

export default router;
