"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Cliente extends sequelize_1.Model {
    id;
    nombre;
    telefono;
    email;
    createdAt;
    updatedAt;
    deletedAt;
}
Cliente.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    email: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "clientes",
    modelName: "Cliente",
    timestamps: true,
    paranoid: true,
    underscored: true,
});
exports.default = Cliente;
