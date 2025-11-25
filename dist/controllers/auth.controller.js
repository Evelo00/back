"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const models_1 = require("../models");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email y contraseña requeridos" });
        // 🔥 TIPADO CORRECTO AQUÍ
        const user = await models_1.User.findOne({ where: { email } });
        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado" });
        const match = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!match)
            return res.status(401).json({ message: "Contraseña incorrecta" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: "7d" });
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
    }
    catch (error) {
        console.error("🔥 ERROR EN LOGIN:", error);
        res.status(500).json({ message: "Error en login" });
    }
};
exports.login = login;
