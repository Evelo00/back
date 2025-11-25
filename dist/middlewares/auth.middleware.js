"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No autorizado" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = (await models_1.User.findByPk(decoded.id));
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Token inválido" });
    }
};
exports.authMiddleware = authMiddleware;
