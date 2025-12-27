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

router.get("/availability", getAvailability);

router.get("/clientes/buscar", buscarClientes);

router.post("/public", createCita);
router.post("/", createCita);
router.get("/", getCitas);

router.get("/:id", authMiddleware, getCitaById);


router.put("/:id", authMiddleware, updateCita);
router.patch("/:id", updateCita);

router.delete("/:id", deleteCita);

export default router;
