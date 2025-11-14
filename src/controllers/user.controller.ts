import type { Request, Response } from "express";
import { User } from "../models/index";
import bcrypt from "bcryptjs";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["passwordHash"] },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["passwordHash"] },
    });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuario", error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { nombre, apellido, email, password, rol, telefono } = req.body;

    if (!nombre || !apellido || !email || !password || !rol) {
      return res.status(400).json({
        message: "Faltan campos requeridos",
      });
    }

    // ---------------------------
    // 🔍 Evitar duplicado de email
    // ---------------------------
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "El correo ya está registrado",
      });
    }

    // ---------------------------
    // 🔐 Hash de contraseña
    // ---------------------------
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      nombre,
      apellido,
      email,
      passwordHash,
      rol,
      telefono: telefono ?? null,
    });

    // ---------------------------
    // 🧼 Respuesta sin passwordHash
    // ---------------------------
    const safeUser = user.toJSON();
     const { passwordHash: _, ...userWithoutPassword } = safeUser;

    res.status(201).json(safeUser);

  } catch (error) {
    res.status(400).json({
      message: "Error al crear usuario",
      error,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    // -------------------------------------
    // ⚠️ Evitar que password llegue en texto
    // -------------------------------------
    if (req.body.password) {
      req.body.passwordHash = await bcrypt.hash(req.body.password, 10);
      delete req.body.password;
    }

    await user.update(req.body);

    const safeUser = user.toJSON();
     const { passwordHash: _, ...userWithoutPassword } = safeUser;

    res.json(safeUser);

  } catch (error) {
    res.status(400).json({ message: "Error al actualizar usuario", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    await user.destroy();
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
};
