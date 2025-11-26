import { Router } from "express";
import {
  createCita,
  getCitas,
  getCitaById,
  updateCita,
  deleteCita,
  getAvailability,
} from "../controllers/cita.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.get("/availability", getAvailability);

router.post("/public", createCita);

router.post("/", createCita);
router.get("/", getCitas);
router.get("/:id", authMiddleware, getCitaById);

router.put("/:id", authMiddleware, requireRole("barbero", "superadmin"), updateCita);
router.patch("/:id", authMiddleware, requireRole("barbero", "superadmin"), updateCita);
router.delete("/:id", authMiddleware, requireRole("superadmin"), deleteCita);

export default router;