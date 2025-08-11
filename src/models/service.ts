import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../config/database.js";

export interface ServiceAttributes {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
}

export type ServiceCreationAttributes = Optional<ServiceAttributes, "id">;

class Service
  extends Model<ServiceAttributes, ServiceCreationAttributes>
  implements ServiceAttributes
{
  public id!: string;
  public nombre!: string;
  public precio!: number;
  public duracion!: number;
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
