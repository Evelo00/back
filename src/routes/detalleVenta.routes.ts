import { Router } from "express";
import {
  createDetalleVenta,
  getDetallesVenta,
  getDetalleVentaById,
  updateDetalleVenta,
  deleteDetalleVenta,
} from "../controllers/detalleVenta.controller.js";

const router = Router();

router.post("/", createDetalleVenta);
router.get("/", getDetallesVenta);
router.get("/:id", getDetalleVentaById);
router.put("/:id", updateDetalleVenta);
router.delete("/:id", deleteDetalleVenta);

export default router;
