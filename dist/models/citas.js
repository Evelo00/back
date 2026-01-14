"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cita = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Cita extends sequelize_1.Model {
}
exports.Cita = Cita;
Cita.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    clienteId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        field: "cliente_id",
    },
    barberoId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        field: "barbero_id",
    },
    servicioId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        field: "servicio_id",
    },
    fechaHora: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: "fecha_hora",
    },
    fechaFin: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        field: "fecha_fin",
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("pendiente", "confirmada", "cancelada", "completada", "bloqueo"),
        defaultValue: "confirmada",
        allowNull: false,
    },
    precioFinal: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "precio_final",
    },
    duracionMinutos: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        field: "duracion_minutos",
    },
    notas: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    nombreCliente: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: "nombre_cliente",
    },
    emailCliente: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: "email_cliente",
    },
    whatsappCliente: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: "whatsapp_cliente",
    },
    sedeId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        field: "sede_id",
    },
    createFrom: {
        type: sequelize_1.DataTypes.ENUM("admin", "cliente"),
        allowNull: false,
        defaultValue: "cliente",
        field: "creada_por",
    },
    createdAt: { type: sequelize_1.DataTypes.DATE, field: "created_at" },
    updatedAt: { type: sequelize_1.DataTypes.DATE, field: "updated_at" },
    deletedAt: { type: sequelize_1.DataTypes.DATE, field: "deleted_at" },
}, {
    sequelize: database_1.sequelize,
    tableName: "citas",
    paranoid: true,
    timestamps: true,
});
exports.default = Cita;
