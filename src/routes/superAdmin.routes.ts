import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import {
  obtenerTodosLosUsuarios,
  crearUsuario,
  actualizarUsuario,
  obtenerTodasLasCitas,
} from "../controllers/superAdmin.controller";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("superadmin"));



//  * GET /api/superadmin/citas
router.get("/citas", obtenerTodasLasCitas);


//  * GET /api/superadmin/users
router.get("/users", obtenerTodosLosUsuarios);


//  * POST /api/superadmin/users

router.post("/users", crearUsuario);


//  * PUT /api/superadmin/users/:id
router.put("/users/:id", actualizarUsuario);


export default router;