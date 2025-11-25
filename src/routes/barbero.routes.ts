import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import {
  obtenerMisCitas,
  obtenerGananciasSemana,
  crearSolicitudCaja,
} from "../controllers/barbero.controller";

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
