import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import type { UserBaseAttributes } from "./UserBase.js";

class Barra extends Model<UserBaseAttributes> implements UserBaseAttributes {
  public id!: string;
  public nombre!: string;
  public correo!: string;
  public contraseña!: string;
  public rol!: string;
}

Barra.init(
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
      defaultValue: "barra",
    },
  },
  {
    sequelize,
    modelName: "Barra",
    tableName: "barras",
    timestamps: false,
  }
);

export default Barra;
