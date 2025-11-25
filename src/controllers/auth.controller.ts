import { Request, Response } from "express";
import { User } from "../models/index";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email y contraseña requeridos" });

    // 🔥 TIPADO CORRECTO AQUÍ
    const user = await User.findOne<User>({ where: { email } });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
      },
    });

  } catch (error) {
    console.error("🔥 ERROR EN LOGIN:", error);
    res.status(500).json({ message: "Error en login" });
  }
};
