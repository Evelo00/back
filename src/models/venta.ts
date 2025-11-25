import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";
import { User } from "./user";

class Venta extends Model {
  public id!: string;
  public fecha!: Date;
  public clienteId!: string;
  public vendedorId!: string;
  public total!: number;
}

Venta.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Venta",
    tableName: "ventas",
    timestamps: true,
  }
);

Venta.belongsTo(User, { as: "clienteVenta", foreignKey: "clienteId" });
Venta.belongsTo(User, { as: "vendedorVenta", foreignKey: "vendedorId" });

export default Venta;
