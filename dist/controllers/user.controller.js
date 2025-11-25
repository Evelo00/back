"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const models_1 = require("../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getUsers = async (req, res) => {
    try {
        // Leer rol desde query string: ?rol=barbero
        const rolFilter = req.query.rol;
        const whereClause = {};
        if (rolFilter) {
            whereClause.rol = rolFilter;
            whereClause.activo = true; // solo activos
        }
        const users = await models_1.User.findAll({
            attributes: { exclude: ["passwordHash"] },
            where: whereClause,
            order: [["nombre", "ASC"]],
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios", error });
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
    try {
        const user = await models_1.User.findByPk(req.params.id, {
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
        const safeUser = user.toJSON();
        const { passwordHash: _, ...userWithoutPassword } = safeUser;
        res.status(201).json(safeUser);
    }
    catch (error) {
        res.status(400).json({
            message: "Error al crear usuario",
            error,
        });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const user = await models_1.User.findByPk(req.params.id);
        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado" });
        if (req.body.password) {
            req.body.passwordHash = await bcryptjs_1.default.hash(req.body.password, 10);
            delete req.body.password;
        }
        await user.update(req.body);
        const safeUser = user.toJSON();
        const { passwordHash: _, ...userWithoutPassword } = safeUser;
        res.json(safeUser);
    }
    catch (error) {
        res.status(400).json({ message: "Error al actualizar usuario", error });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const user = await models_1.User.findByPk(req.params.id);
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
