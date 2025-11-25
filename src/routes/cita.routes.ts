import { Router } from "express";
import {
  createCita,
  getCitas,
  getCitaById,
  updateCita,
  deleteCita,
} from "../controllers/cita.controller";


import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.post("/", authMiddleware, createCita);
router.get("/", authMiddleware, getCitas);
router.get("/:id", authMiddleware, getCitaById);


router.put(
  "/:id",
  authMiddleware,
  requireRole("barbero", "superadmin"),
  updateCita
);

router.patch(
  "/:id",
  authMiddleware,
  requireRole("barbero", "superadmin"),
  updateCita
);

router.delete(
  "/:id",
  authMiddleware,
  requireRole("superadmin"),
  deleteCita
);

export default router;