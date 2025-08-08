import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class ProductoNevera extends Model {
  public id!: string;
  public nombre!: string;
  public precio!: number;
}

ProductoNevera.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ProductoNevera",
    tableName: "productos_nevera",
    timestamps: false,
  }
);

export default ProductoNevera;
