"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudCaja = exports.Cita = exports.Service = exports.Venta = exports.Sede = exports.User = exports.sequelizeConnection = void 0;
const database_1 = require("../config/database");
Object.defineProperty(exports, "sequelizeConnection", { enumerable: true, get: function () { return database_1.sequelize; } });
const user_1 = require("./user");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_1.User; } });
const sede_1 = require("./sede");
Object.defineProperty(exports, "Sede", { enumerable: true, get: function () { return sede_1.Sede; } });
const venta_1 = __importDefault(require("./venta"));
exports.Venta = venta_1.default;
const service_1 = __importDefault(require("./service"));
exports.Service = service_1.default;
const citas_1 = __importDefault(require("./citas")); // ← OJO: usar export nombrado
exports.Cita = citas_1.default;
const solicitud_model_1 = require("./solicitud.model");
Object.defineProperty(exports, "SolicitudCaja", { enumerable: true, get: function () { return solicitud_model_1.SolicitudCaja; } });
const citaServicio_1 = __importDefault(require("./citaServicio"));
sede_1.Sede.hasMany(user_1.User, {
    foreignKey: "sedeId",
    as: "usuarios",
});
user_1.User.belongsTo(sede_1.Sede, {
    foreignKey: "sedeId",
    as: "sede",
});
user_1.User.hasMany(venta_1.default, {
    foreignKey: "usuarioId",
    as: "ventas",
});
venta_1.default.belongsTo(user_1.User, {
    foreignKey: "usuarioId",
    as: "usuario",
});
user_1.User.hasMany(venta_1.default, {
    foreignKey: "clienteId",
    as: "comprasCliente",
});
venta_1.default.belongsTo(user_1.User, {
    foreignKey: "clienteId",
    as: "cliente",
});
user_1.User.hasMany(citas_1.default, {
    foreignKey: "barberoId",
    as: "citasBarbero",
});
citas_1.default.belongsTo(user_1.User, {
    foreignKey: "barberoId",
    as: "barberoCita",
});
user_1.User.hasMany(solicitud_model_1.SolicitudCaja, {
    foreignKey: "barberoId",
    as: "solicitudesCaja",
});
solicitud_model_1.SolicitudCaja.belongsTo(user_1.User, {
    foreignKey: "barberoId",
    as: "barberoSolicitud",
});
citas_1.default.hasMany(citaServicio_1.default, {
    foreignKey: "citaId",
    as: "servicios",
});
citaServicio_1.default.belongsTo(citas_1.default, {
    foreignKey: "citaId",
    as: "cita",
});
service_1.default.hasMany(citaServicio_1.default, {
    foreignKey: "servicioId",
    as: "citas",
});
citaServicio_1.default.belongsTo(service_1.default, {
    foreignKey: "servicioId",
    as: "servicio",
});
