import { Router } from "express";
import {
  createBarra,
  getBarras,
  getBarraById,
  updateBarra,
  deleteBarra,
} from "../controllers/barra.controller";

const router = Router();

router.post("/", createBarra);
router.get("/", getBarras);
router.get("/:id", getBarraById);
router.put("/:id", updateBarra);
router.delete("/:id", deleteBarra);

export default router;
