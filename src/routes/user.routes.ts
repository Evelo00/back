import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPublicBarbers,
} from "../controllers/user.controller";

import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/public/barbers", getPublicBarbers);
router.post("/", createUser);

router.get("/", authMiddleware, getUsers);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
