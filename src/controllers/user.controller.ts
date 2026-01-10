import type { Request, Response } from "express";
import { User } from "../models";
import bcrypt from "bcryptjs";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { rol, sedeId } = req.query;

    const whereClause: any = {
      activo: true,
    };

    if (rol) {
      whereClause.rol = rol;
    }

    if (sedeId) {
      whereClause.sedeId = sedeId;
    }

    const users = await User.findAll({
      attributes: { exclude: ["passwordHash"] },
      where: whereClause,
      order: [["silla", "ASC"]],
    });

    res.json(users);
  } catch (error) {
    console.error("❌ Error getUsers:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await User.findByPk(id, {
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

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "El correo ya está registrado",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      nombre,
      apellido,
      email,
      passwordHash,
      rol,
      telefono: telefono ?? null,
    });

    const { passwordHash: _, ...safeUser } = user.toJSON();

    return res.status(201).json(safeUser);

  } catch (error) {
    return res.status(400).json({
      message: "Error al crear usuario",
      error,
    });
  }
};


export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const user = await User.findByPk(id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    if (req.body.password) {
      req.body.passwordHash = await bcrypt.hash(req.body.password, 10);
      delete req.body.password;
    }

    await user.update(req.body);

    const { passwordHash: _, ...safeUser } = user.toJSON();

    return res.json(safeUser);

  } catch (error) {
    return res.status(400).json({ message: "Error al actualizar usuario", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await User.findByPk(id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    await user.destroy();
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error });
  }
};

export const getPublicBarbers = async (req: Request, res: Response) => {
  try {
    const backendURL = (process.env.BACKEND_URL || "http://localhost:4000")
      .replace(/\/$/, "");

    const { sedeId } = req.query;

    const whereClause: any = {
      rol: "barbero",
      activo: true,
    };

    // 🔐 filtro multisede correcto
    if (sedeId) {
      whereClause.sedeId = sedeId;
    }

    const barbers = await User.findAll({
      attributes: ["id", "nombre", "apellido", "avatar", "silla", "telefono"],
      where: whereClause,
      order: [["silla", "ASC"]],
    });

    const mapped = barbers.map((barber) => {
      let avatar = barber.avatar;

      if (avatar && !avatar.startsWith("http")) {
        avatar = `${backendURL}/public/${avatar.replace(/^\/+/, "")}`;
      }

      return {
        id: barber.id,
        nombre: barber.nombre,
        apellido: barber.apellido,
        nombreCompleto: `${barber.nombre} ${barber.apellido}`.trim(),
        avatar: avatar || null,
        silla: barber.silla,
        telefono: barber.telefono || null,
      };
    });

    return res.status(200).json(mapped);

  } catch (error) {
    console.error("❌ ERROR getPublicBarbers:", error);
    return res.status(500).json({
      message: "Error al obtener barberos públicos",
    });
  }
};
