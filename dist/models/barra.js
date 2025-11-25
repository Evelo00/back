"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Barra extends sequelize_1.Model {
    id;
    nombre;
    correo;
    contraseña;
    rol;
}
Barra.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    correo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    contraseña: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    rol: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: "barra",
    },
}, {
    sequelize: database_1.sequelize,
    modelName: "Barra",
    tableName: "barras",
    timestamps: false,
});
exports.default = Barra;
