import { Router } from "express";
import {
  createSede,
  getSedes,
  getSedeById,
  updateSede,
  deleteSede,
} from "../controllers/sede.controller.js";

const router = Router();

router.post("/", createSede);
router.get("/", getSedes);
router.get("/:id", getSedeById);
router.put("/:id", updateSede);
router.delete("/:id", deleteSede);

export default router;
