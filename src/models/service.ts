import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Service extends Model {
  public id!: string;
  public nombre!: string;
  public precio!: number;
  public duracion!: number; // minutos
}

Service.init(
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
    duracion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Duración en minutos",
    },
  },
  {
    sequelize,
    modelName: "Servicio",
    tableName: "servicios",
    timestamps: false,
  }
);

export default Service;
