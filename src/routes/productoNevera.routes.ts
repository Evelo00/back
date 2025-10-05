import { Router } from "express";
import {
  createProductoNevera,
  getProductosNevera,
  getProductoNeveraById,
  updateProductoNevera,
  deleteProductoNevera,
} from "../controllers/productoNevera.controller.js";

const router = Router();

router.post("/", createProductoNevera);
router.get("/", getProductosNevera);
router.get("/:id", getProductoNeveraById);
router.put("/:id", updateProductoNevera);
router.delete("/:id", deleteProductoNevera);

export default router;
