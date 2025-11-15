// src/models/index.ts
import { Sequelize } from "sequelize";
import { User } from "./user";
import { Sede } from "./sede";
import Venta from "./venta";
import DetalleVenta from "./detalleVenta";
import ProductoNevera from "./productoNevera";
import Service from "./service";
import VitrinaCounter from "./vitrinaCounter";
import Barra from "./barra";
import Cita from "./citas";
import { SolicitudCaja } from "./solicitud.model";

import {
  sequelize as sequelizeConnection,
  connectDB,
} from "../config/database.js";

/*
   RELACIONES
*/

// Una sede tiene muchos usuarios
Sede.hasMany(User, {
  foreignKey: "sedeId",
  as: "usuarios",
});
User.belongsTo(Sede, {
  foreignKey: "sedeId",
  as: "sede",
});

// Ventas hechas por barbero/caja
User.hasMany(Venta, {
  foreignKey: "usuarioId",
  as: "ventas",
});
Venta.belongsTo(User, {
  foreignKey: "usuarioId",
  as: "usuario",
});

// Ventas a clientes
User.hasMany(Venta, {
  foreignKey: "clienteId",
  as: "comprasCliente",
});
Venta.belongsTo(User, {
  foreignKey: "clienteId",
  as: "cliente",
});

// Detalles de venta
Venta.hasMany(DetalleVenta, {
  foreignKey: "ventaId",
  as: "detalles",
});
DetalleVenta.belongsTo(Venta, {
  foreignKey: "ventaId",
  as: "venta",
});

// Productos - detalles
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

/*  
   --- RELACIONES DE CITA ---
*/

// Un cliente tiene muchas citas
User.hasMany(Cita, {
  foreignKey: "clienteId",
  as: "citasCliente",
});
Cita.belongsTo(User, {
  foreignKey: "clienteId",
  as: "clienteCita",
});

// Un barbero tiene muchas citas
User.hasMany(Cita, {
  foreignKey: "barberoId",
  as: "citasBarbero",
});
Cita.belongsTo(User, {
  foreignKey: "barberoId",
  as: "barberoCita",
});

// El servicio pertenece a muchas citas
Service.hasMany(Cita, {
  foreignKey: "servicioId",
  as: "citasServicio",
});
Cita.belongsTo(Service, {
  foreignKey: "servicioId",
  as: "servicioCita",
});

/*  
   --- RELACIÓN DE SOLICITUD DE CAJA ---
*/

User.hasMany(SolicitudCaja, {
  foreignKey: "barberoId",
  as: "solicitudesCaja",
});
SolicitudCaja.belongsTo(User, {
  foreignKey: "barberoId",
  as: "barberoSolicitud",
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
  Cita,
  SolicitudCaja
};
