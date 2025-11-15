import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  obtenerMisCitas,
  obtenerGananciasSemana,
  crearSolicitudCaja,
} from "../controllers/barbero.controller.js";

const router = Router();

router.get(
  "/citas",
  authMiddleware,
  requireRole("barbero"),
  obtenerMisCitas
);

router.get(
  "/ganancias",
  authMiddleware,
  requireRole("barbero"),
  obtenerGananciasSemana
);

router.post(
  "/solicitudes",
  authMiddleware,
  requireRole("barbero"),
  crearSolicitudCaja
);

export default router;
