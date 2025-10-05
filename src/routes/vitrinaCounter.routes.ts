import { Router } from "express";
import {
  createVitrina,
  getVitrinas,
  getVitrinaById,
  updateVitrina,
  deleteVitrina,
} from "../controllers/vitrinaCounter.controller.js";

const router = Router();

router.post("/", createVitrina);
router.get("/", getVitrinas);
router.get("/:id", getVitrinaById);
router.put("/:id", updateVitrina);
router.delete("/:id", deleteVitrina);

export default router;
