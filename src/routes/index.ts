import { Router } from "express";
import userRoutes from "./user.routes";
import sedeRoutes from "./sede.routes";
import serviceRoutes from "./service.routes";
import productoNeveraRoutes from "./productoNevera.routes";
import vitrinaCounterRoutes from "./vitrinaCounter.routes";
import ventaRoutes from "./venta.routes";
import detalleVentaRoutes from "./detalleVenta.routes";
import barraRoutes from "./barra.routes";
import citaRoutes from "./cita.routes";
import barberoRoutes from "./barbero.routes";
import superadminRoutes from "./superAdmin.routes";

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