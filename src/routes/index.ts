import { Router } from "express";

import userRoutes from "./user.routes";
import sedeRoutes from "./sede.routes";
import serviceRoutes from "./service.routes";
import citaRoutes from "./cita.routes";

import superadminRoutes from "./superAdmin.routes";

import seedRoutes from "./seed.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/services", serviceRoutes);
router.use("/sedes", sedeRoutes);
router.use("/citas", citaRoutes);

router.use("/superadmin", superadminRoutes);

if (process.env.NODE_ENV !== "production") {
  router.use("/seed", seedRoutes);
}

router.use((_req, res) => {
  res.status(404).json({
    status: 404,
    message: "Ruta no encontrada en la API de Barbería",
  });
});

export default router;
