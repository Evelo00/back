"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const venta_1 = __importDefault(require("./venta"));
const productoNevera_1 = __importDefault(require("./productoNevera"));
const service_1 = __importDefault(require("./service"));
class DetalleVenta extends sequelize_1.Model {
    id;
    ventaId;
    productoId;
    servicioId;
    cantidad;
    precioUnitario;
    subtotal;
}
DetalleVenta.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    cantidad: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    precioUnitario: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    subtotal: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: "DetalleVenta",
    tableName: "detalles_venta",
    timestamps: false,
});
// Relaciones
DetalleVenta.belongsTo(venta_1.default, { foreignKey: "ventaId" });
DetalleVenta.belongsTo(productoNevera_1.default, {
    as: "productoDetalle",
    foreignKey: "productoId",
});
DetalleVenta.belongsTo(service_1.default, {
    as: "servicioDetalle",
    foreignKey: "servicioId",
});
exports.default = DetalleVenta;
