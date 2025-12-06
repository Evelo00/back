"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitaServicio = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class CitaServicio extends sequelize_1.Model {
}
exports.CitaServicio = CitaServicio;
CitaServicio.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    citaId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        field: "cita_id",
    },
    servicioId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        field: "servicio_id",
    },
    precio: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    duracion: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "cita_servicios",
    timestamps: false,
});
exports.default = CitaServicio;
