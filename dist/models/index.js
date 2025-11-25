"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudCaja = exports.Cita = exports.Service = exports.Venta = exports.Sede = exports.User = exports.sequelizeConnection = void 0;
const user_1 = require("./user");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_1.User; } });
const sede_1 = require("./sede");
Object.defineProperty(exports, "Sede", { enumerable: true, get: function () { return sede_1.Sede; } });
const venta_1 = __importDefault(require("./venta"));
exports.Venta = venta_1.default;
// import DetalleVenta from "./detalleVenta";
// import ProductoNevera from "./productoNevera";
const service_1 = __importDefault(require("./service"));
exports.Service = service_1.default;
// import VitrinaCounter from "./vitrinaCounter";
// import Barra from "./barra";
const citas_1 = __importDefault(require("./citas"));
exports.Cita = citas_1.default;
const solicitud_model_1 = require("./solicitud.model");
Object.defineProperty(exports, "SolicitudCaja", { enumerable: true, get: function () { return solicitud_model_1.SolicitudCaja; } });
const database_1 = require("../config/database");
Object.defineProperty(exports, "sequelizeConnection", { enumerable: true, get: function () { return database_1.sequelize; } });
/*
   RELACIONES
*/
// Una sede tiene muchos usuarios
sede_1.Sede.hasMany(user_1.User, {
    foreignKey: "sedeId",
    as: "usuarios",
});
user_1.User.belongsTo(sede_1.Sede, {
    foreignKey: "sedeId",
    as: "sede",
});
// Ventas hechas por barbero/caja
user_1.User.hasMany(venta_1.default, {
    foreignKey: "usuarioId",
    as: "ventas",
});
venta_1.default.belongsTo(user_1.User, {
    foreignKey: "usuarioId",
    as: "usuario",
});
// Ventas a clientes
user_1.User.hasMany(venta_1.default, {
    foreignKey: "clienteId",
    as: "comprasCliente",
});
venta_1.default.belongsTo(user_1.User, {
    foreignKey: "clienteId",
    as: "cliente",
});
// Detalles de venta
// Venta.hasMany(DetalleVenta, {
//   foreignKey: "ventaId",
//   as: "detalles",
// });
// DetalleVenta.belongsTo(Venta, {
//   foreignKey: "ventaId",
//   as: "venta",
// });
// // Productos - detalles
// ProductoNevera.hasMany(DetalleVenta, {
//   foreignKey: "productoNeveraId",
//   as: "detallesVenta",
// });
// DetalleVenta.belongsTo(ProductoNevera, {
//   foreignKey: "productoNeveraId",
//   as: "productoNevera",
// });
// Servicios vendidos
// Service.hasMany(DetalleVenta, {
//   foreignKey: "servicioId",
//   as: "detallesServicio",
// });
// DetalleVenta.belongsTo(Service, {
//   foreignKey: "servicioId",
//   as: "servicio",
// });
/*
   --- RELACIONES DE CITA ---
*/
// Un cliente tiene muchas citas
user_1.User.hasMany(citas_1.default, {
    foreignKey: "clienteId",
    as: "citasCliente",
});
citas_1.default.belongsTo(user_1.User, {
    foreignKey: "clienteId",
    as: "clienteCita",
});
// Un barbero tiene muchas citas
user_1.User.hasMany(citas_1.default, {
    foreignKey: "barberoId",
    as: "citasBarbero",
});
citas_1.default.belongsTo(user_1.User, {
    foreignKey: "barberoId",
    as: "barberoCita",
});
// El servicio pertenece a muchas citas
service_1.default.hasMany(citas_1.default, {
    foreignKey: "servicioId",
    as: "citasServicio",
});
citas_1.default.belongsTo(service_1.default, {
    foreignKey: "servicioId",
    as: "servicioCita",
});
/*
   --- RELACIÓN DE SOLICITUD DE CAJA ---
*/
user_1.User.hasMany(solicitud_model_1.SolicitudCaja, {
    foreignKey: "barberoId",
    as: "solicitudesCaja",
});
solicitud_model_1.SolicitudCaja.belongsTo(user_1.User, {
    foreignKey: "barberoId",
    as: "barberoSolicitud",
});
