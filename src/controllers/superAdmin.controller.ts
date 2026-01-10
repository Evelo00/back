import { Request, Response } from "express";
import { User } from "../models/user";
import Cita from "../models/citas";
import Service from "../models/service";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";


export const obtenerTodosLosUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await User.findAll({
      attributes: { exclude: ["passwordHash"] },
      order: [["nombre", "ASC"]],
    });
    return res.json(usuarios);
  } catch (error) {
    console.error("❌ ERROR obtenerTodosLosUsuarios:", error);
    return res.status(500).json({ message: "Error al obtener usuarios" });
  }
};


export const crearUsuario = async (req: Request, res: Response) => {
  const { email, password, nombre, apellido, rol, telefono } = req.body;


  if (!["caja", "barbero", "cliente"].includes(rol)) {
    return res.status(400).json({ message: "Rol no válido." });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "El correo electrónico ya está en uso." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = await User.create({
      email,
      passwordHash,
      nombre,
      apellido,
      rol,
      telefono,
      activo: true,
    } as any);

    const userResponse = {
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
      nombre: nuevoUsuario.nombre,
      rol: nuevoUsuario.rol,
    };

    return res.status(201).json(userResponse);
  } catch (error) {
    console.error("❌ ERROR crearUsuario:", error);
    return res.status(500).json({ message: "Error al crear el usuario" });
  }
};


export const actualizarUsuario = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { rol, activo, nombre, apellido, telefono } = req.body;

  try {
    const usuario = await User.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    usuario.nombre = nombre ?? usuario.nombre;
    usuario.apellido = apellido ?? usuario.apellido;
    usuario.telefono = telefono ?? usuario.telefono;
    usuario.rol = rol ?? usuario.rol;
    usuario.activo = activo ?? usuario.activo;

    await usuario.save();

    const userResponse = await User.findByPk(id, {
      attributes: { exclude: ["passwordHash"] }
    });

    return res.json(userResponse);
  } catch (error) {
    console.error("❌ ERROR actualizarUsuario:", error);
    return res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};


export const obtenerTodasLasCitas = async (_req: Request, res: Response) => {
  try {
    const citas = await Cita.findAll({
      where: { estado: { [Op.not]: "bloqueo" } }, // ignorar bloques
      order: [["fechaHora", "ASC"]],
      include: [
        {
          model: Service,
          as: "servicioCita"
        },
        {
          model: User,
          as: "clienteCita",
          attributes: ["nombre"]
        },
        {
          model: User,
          as: "barberoCita",
          attributes: ["nombre", "apellido"]
        }
      ],
    });

    return res.json(citas);
  } catch (error) {
    console.error("❌ ERROR obtenerTodasLasCitas:", error);
    return res.status(500).json({ message: "Error al obtener todas las citas" });
  }
};
