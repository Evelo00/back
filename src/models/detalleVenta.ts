import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import Venta from "./Venta";
import ProductoNevera from "./ProductoNevera";
import Service from "./Service";

class DetalleVenta extends Model {
  public id!: string;
  public ventaId!: string;
  public productoId?: string;
  public servicioId?: string;
  public cantidad!: number;
  public precioUnitario!: number;
  public subtotal!: number;
}

DetalleVenta.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precioUnitario: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "DetalleVenta",
    tableName: "detalles_venta",
    timestamps: false,
  }
);

// Relaciones
DetalleVenta.belongsTo(Venta, { foreignKey: "ventaId" });
DetalleVenta.belongsTo(ProductoNevera, {
  as: "productoDetalle",
  foreignKey: "productoId",
});
DetalleVenta.belongsTo(Service, {
  as: "servicioDetalle",
  foreignKey: "servicioId",
});

export default DetalleVenta;
