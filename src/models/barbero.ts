import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import type { UserBaseAttributes } from "./UserBase.js";

class Barbero extends Model<UserBaseAttributes> implements UserBaseAttributes {
  public id!: string;
  public nombre!: string;
  public correo!: string;
  public contraseña!: string;
  public rol!: string;
}

Barbero.init(
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
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contraseña: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.STRING,
      defaultValue: "barbero",
    },
  },
  {
    sequelize,
    modelName: "Barbero",
    tableName: "barberos",
    timestamps: false,
  }
);

export default Barbero;
