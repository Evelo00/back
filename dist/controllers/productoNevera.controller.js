"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductoNevera = exports.updateProductoNevera = exports.createProductoNevera = exports.getProductoNeveraById = exports.getProductosNevera = void 0;
const productoNevera_1 = __importDefault(require("../models/productoNevera"));
const getProductosNevera = async (req, res) => {
    try {
        const productos = await productoNevera_1.default.findAll();
        res.json(productos);
    }
    catch {
        res.status(500).json({ error: "Error al obtener productos" });
    }
};
exports.getProductosNevera = getProductosNevera;
const getProductoNeveraById = async (req, res) => {
    try {
        const producto = await productoNevera_1.default.findByPk(req.params.id);
        if (!producto)
            return res.status(404).json({ error: "Producto no encontrado" });
        res.json(producto);
    }
    catch {
        res.status(500).json({ error: "Error al obtener producto" });
    }
};
exports.getProductoNeveraById = getProductoNeveraById;
const createProductoNevera = async (req, res) => {
    try {
        const producto = await productoNevera_1.default.create(req.body);
        res.status(201).json(producto);
    }
    catch {
        res.status(400).json({ error: "Error al crear producto" });
    }
};
exports.createProductoNevera = createProductoNevera;
const updateProductoNevera = async (req, res) => {
    try {
        const producto = await productoNevera_1.default.findByPk(req.params.id);
        if (!producto)
            return res.status(404).json({ error: "Producto no encontrado" });
        await producto.update(req.body);
        res.json(producto);
    }
    catch {
        res.status(400).json({ error: "Error al actualizar producto" });
    }
};
exports.updateProductoNevera = updateProductoNevera;
const deleteProductoNevera = async (req, res) => {
    try {
        const producto = await productoNevera_1.default.findByPk(req.params.id);
        if (!producto)
            return res.status(404).json({ error: "Producto no encontrado" });
        await producto.destroy();
        res.json({ message: "Producto eliminado correctamente" });
    }
    catch {
        res.status(500).json({ error: "Error al eliminar producto" });
    }
};
exports.deleteProductoNevera = deleteProductoNevera;
