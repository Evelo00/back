import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database";

class VitrinaCounter extends Model {
  public id!: string;
  public nombre!: string;
  public precio!: number;
}

VitrinaCounter.init(
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
    modelName: "VitrinaCounter",
    tableName: "productos_vitrina_counter",
    timestamps: false,
  }
);

export default VitrinaCounter;
