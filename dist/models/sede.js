"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sede = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Sede extends sequelize_1.Model {
    id;
    nombre;
    direccion;
    activo;
    createdAt;
    updatedAt;
    deletedAt;
}
exports.Sede = Sede;
Sede.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombre: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    direccion: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    activo: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: true },
}, {
    sequelize: database_1.sequelize,
    tableName: "sedes",
    paranoid: true,
    timestamps: true,
});
