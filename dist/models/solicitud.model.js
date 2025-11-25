"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudCaja = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class SolicitudCaja extends sequelize_1.Model {
}
exports.SolicitudCaja = SolicitudCaja;
SolicitudCaja.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    barberoId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        field: "barbero_id",
    },
    tipo: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    descripcion: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    estado: {
        type: sequelize_1.DataTypes.ENUM("pendiente", "aprobado", "rechazado"),
        defaultValue: "pendiente",
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "solicitudes_caja",
});
