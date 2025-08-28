// src/models/index.ts
import { Sequelize } from "sequelize";
import { User } from "./user.js";
import { Sede } from "./sede.js";
import Venta from "./venta.js";
import DetalleVenta from "./detalleVenta.js";
import ProductoNevera from "./productoNevera.js";
import Service from "./service.js";
import VitrinaCounter from "./vitrinaCounter.js";
import Barra from "./barra.js";

import {
  sequelize as sequelizeConnection,
  connectDB,
} from "../config/database.js";

// Inicializar modelos
const UserInit = User;
const SedeInit = Sede;
const VentaInit = Venta;
const DetalleVentaInit = DetalleVenta;
const ProductoNeveraInit = ProductoNevera;
const ServiceInit = Service;
const VitrinaCounterInit = VitrinaCounter;
const BarraInit = Barra;

/* 
   RELACIONES
*/

// Una sede tiene muchos usuarios con roles "barbero", "caja", "admin"
Sede.hasMany(User, {
  foreignKey: "sedeId",
  as: "usuarios",
});
User.belongsTo(Sede, {
  foreignKey: "sedeId",
  as: "sede",
});

// Ventas hechas por usuarios (barbero o caja)
User.hasMany(Venta, {
  foreignKey: "usuarioId",
  as: "ventas",
});
Venta.belongsTo(User, {
  foreignKey: "usuarioId",
  as: "usuario",
});

// Ventas hechas a clientes
User.hasMany(Venta, {
  foreignKey: "clienteId",
  as: "comprasCliente",
});
Venta.belongsTo(User, {
  foreignKey: "clienteId",
  as: "cliente",
});

// Detalle de ventas
Venta.hasMany(DetalleVenta, {
  foreignKey: "ventaId",
  as: "detalles",
});
DetalleVenta.belongsTo(Venta, {
  foreignKey: "ventaId",
  as: "venta",
});

// Relación productos - detalles
ProductoNevera.hasMany(DetalleVenta, {
  foreignKey: "productoNeveraId",
  as: "detallesVenta",
});
DetalleVenta.belongsTo(ProductoNevera, {
  foreignKey: "productoNeveraId",
  as: "productoNevera",
});

// Servicios vendidos
Service.hasMany(DetalleVenta, {
  foreignKey: "servicioId",
  as: "detallesServicio",
});
DetalleVenta.belongsTo(Service, {
  foreignKey: "servicioId",
  as: "servicio",
});

export {
  sequelizeConnection,
  User,
  Sede,
  Venta,
  DetalleVenta,
  ProductoNevera,
  Service,
  VitrinaCounter,
  Barra,
};
