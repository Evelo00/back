import { Router } from "express";
import userRoutes from "./user.routes.js";
import sedeRoutes from "./sede.routes.js";
import serviceRoutes from "./service.routes.js";
import productoNeveraRoutes from "./productoNevera.routes.js";
import vitrinaCounterRoutes from "./vitrinaCounter.routes.js";
import ventaRoutes from "./venta.routes.js";
import detalleVentaRoutes from "./detalleVenta.routes.js";
import barraRoutes from "./barra.routes.js";
import citaRoutes from "./cita.routes.js";
import barberoRoutes from "./barbero.routes.js";
import superadminRoutes from "./superAdmin.routes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/sedes", sedeRoutes);
router.use("/services", serviceRoutes);
router.use("/productos-nevera", productoNeveraRoutes);
router.use("/vitrinas", vitrinaCounterRoutes);
router.use("/ventas", ventaRoutes);
router.use("/detalles-venta", detalleVentaRoutes);
router.use("/barras", barraRoutes);
router.use("/citas", citaRoutes);
router.use("/barbero", barberoRoutes);

router.use("/superadmin", superadminRoutes);

export default router;