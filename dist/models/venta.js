"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_1 = require("./user");
class Venta extends sequelize_1.Model {
    id;
    fecha;
    clienteId;
    vendedorId;
    total;
}
Venta.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    fecha: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    total: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: "Venta",
    tableName: "ventas",
    timestamps: true,
});
Venta.belongsTo(user_1.User, { as: "clienteVenta", foreignKey: "clienteId" });
Venta.belongsTo(user_1.User, { as: "vendedorVenta", foreignKey: "vendedorId" });
exports.default = Venta;
