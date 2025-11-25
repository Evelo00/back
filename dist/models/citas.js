"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/cita.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Cita extends sequelize_1.Model {
    id;
    clienteId;
    barberoId;
    servicioId;
    fechaHora;
    estado;
    precioFinal;
    duracionMinutos;
    notas;
}
Cita.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    clienteId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    barberoId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    servicioId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    fechaHora: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM("pendiente", "confirmada", "cancelada", "completada"),
        allowNull: false,
        defaultValue: "pendiente",
    },
    precioFinal: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    duracionMinutos: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
    },
    notas: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: "Cita",
    tableName: "citas",
    timestamps: true,
});
exports.default = Cita;
