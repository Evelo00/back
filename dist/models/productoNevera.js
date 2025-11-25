"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class ProductoNevera extends sequelize_1.Model {
    id;
    nombre;
    precio;
}
ProductoNevera.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    precio: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: "ProductoNevera",
    tableName: "productos_nevera",
    timestamps: false,
});
exports.default = ProductoNevera;
