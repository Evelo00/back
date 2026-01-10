"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerTodasLasCitas = exports.actualizarUsuario = exports.crearUsuario = exports.obtenerTodosLosUsuarios = void 0;
const user_1 = require("../models/user");
const citas_1 = __importDefault(require("../models/citas"));
const service_1 = __importDefault(require("../models/service"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sequelize_1 = require("sequelize");
const obtenerTodosLosUsuarios = async (_req, res) => {
    try {
        const usuarios = await user_1.User.findAll({
            attributes: { exclude: ["passwordHash"] },
            order: [["nombre", "ASC"]],
        });
        return res.json(usuarios);
    }
    catch (error) {
        console.error("❌ ERROR obtenerTodosLosUsuarios:", error);
        return res.status(500).json({ message: "Error al obtener usuarios" });
    }
};
exports.obtenerTodosLosUsuarios = obtenerTodosLosUsuarios;
const crearUsuario = async (req, res) => {
    const { email, password, nombre, apellido, rol, telefono } = req.body;
    if (!["caja", "barbero", "cliente"].includes(rol)) {
        return res.status(400).json({ message: "Rol no válido." });
    }
    try {
        const existingUser = await user_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "El correo electrónico ya está en uso." });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const nuevoUsuario = await user_1.User.create({
            email,
            passwordHash,
            nombre,
            apellido,
            rol,
            telefono,
            activo: true,
        });
        const userResponse = {
            id: nuevoUsuario.id,
            email: nuevoUsuario.email,
            nombre: nuevoUsuario.nombre,
            rol: nuevoUsuario.rol,
        };
        return res.status(201).json(userResponse);
    }
    catch (error) {
        console.error("❌ ERROR crearUsuario:", error);
        return res.status(500).json({ message: "Error al crear el usuario" });
    }
};
exports.crearUsuario = crearUsuario;
const actualizarUsuario = async (req, res) => {
    const id = req.params.id;
    const { rol, activo, nombre, apellido, telefono } = req.body;
    try {
        const usuario = await user_1.User.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        usuario.nombre = nombre ?? usuario.nombre;
        usuario.apellido = apellido ?? usuario.apellido;
        usuario.telefono = telefono ?? usuario.telefono;
        usuario.rol = rol ?? usuario.rol;
        usuario.activo = activo ?? usuario.activo;
        await usuario.save();
        const userResponse = await user_1.User.findByPk(id, {
            attributes: { exclude: ["passwordHash"] }
        });
        return res.json(userResponse);
    }
    catch (error) {
        console.error("❌ ERROR actualizarUsuario:", error);
        return res.status(500).json({ message: "Error al actualizar el usuario" });
    }
};
exports.actualizarUsuario = actualizarUsuario;
const obtenerTodasLasCitas = async (_req, res) => {
    try {
        const citas = await citas_1.default.findAll({
            where: { estado: { [sequelize_1.Op.not]: "bloqueo" } }, // ignorar bloques
            order: [["fechaHora", "ASC"]],
            include: [
                {
                    model: service_1.default,
                    as: "servicioCita"
                },
                {
                    model: user_1.User,
                    as: "clienteCita",
                    attributes: ["nombre"]
                },
                {
                    model: user_1.User,
                    as: "barberoCita",
                    attributes: ["nombre", "apellido"]
                }
            ],
        });
        return res.json(citas);
    }
    catch (error) {
        console.error("❌ ERROR obtenerTodasLasCitas:", error);
        return res.status(500).json({ message: "Error al obtener todas las citas" });
    }
};
exports.obtenerTodasLasCitas = obtenerTodasLasCitas;
