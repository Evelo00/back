"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicBarbers = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const models_1 = require("../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getUsers = async (req, res) => {
    try {
        const { rol, sedeId } = req.query;
        const whereClause = {
            activo: true,
        };
        if (rol) {
            whereClause.rol = rol;
        }
        if (sedeId) {
            whereClause.sedeId = sedeId;
        }
        const users = await models_1.User.findAll({
            attributes: { exclude: ["passwordHash"] },
            where: whereClause,
            order: [["silla", "ASC"]],
        });
        res.json(users);
    }
    catch (error) {
        console.error("❌ Error getUsers:", error);
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await models_1.User.findByPk(id, {
            attributes: { exclude: ["passwordHash"] },
        });
        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener usuario", error });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const { nombre, apellido, email, password, rol, telefono } = req.body;
        if (!nombre || !apellido || !email || !password || !rol) {
            return res.status(400).json({
                message: "Faltan campos requeridos",
            });
        }
        const existingUser = await models_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                message: "El correo ya está registrado",
            });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await models_1.User.create({
            nombre,
            apellido,
            email,
            passwordHash,
            rol,
            telefono: telefono ?? null,
        });
        const { passwordHash: _, ...safeUser } = user.toJSON();
        return res.status(201).json(safeUser);
    }
    catch (error) {
        return res.status(400).json({
            message: "Error al crear usuario",
            error,
        });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await models_1.User.findByPk(id);
        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado" });
        if (req.body.password) {
            req.body.passwordHash = await bcryptjs_1.default.hash(req.body.password, 10);
            delete req.body.password;
        }
        await user.update(req.body);
        const { passwordHash: _, ...safeUser } = user.toJSON();
        return res.json(safeUser);
    }
    catch (error) {
        return res.status(400).json({ message: "Error al actualizar usuario", error });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await models_1.User.findByPk(id);
        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado" });
        await user.destroy();
        res.json({ message: "Usuario eliminado correctamente" });
    }
    catch (error) {
        res.status(500).json({ message: "Error al eliminar usuario", error });
    }
};
exports.deleteUser = deleteUser;
const getPublicBarbers = async (req, res) => {
    try {
        const backendURL = (process.env.BACKEND_URL || "http://localhost:4000")
            .replace(/\/$/, "");
        const { sedeId } = req.query;
        const whereClause = {
            rol: "barbero",
            activo: true,
        };
        // 🔐 filtro multisede correcto
        if (sedeId) {
            whereClause.sedeId = sedeId;
        }
        const barbers = await models_1.User.findAll({
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
    }
    catch (error) {
        console.error("❌ ERROR getPublicBarbers:", error);
        return res.status(500).json({
            message: "Error al obtener barberos públicos",
        });
    }
};
exports.getPublicBarbers = getPublicBarbers;
