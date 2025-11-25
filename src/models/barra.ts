import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../config/database";

interface BarraAttributes {
  id: string;
  nombre: string;
  correo: string;
  contraseña: string;
  rol: string;
}

interface BarraCreationAttributes
  extends Optional<BarraAttributes, "id" | "rol"> {}

class Barra
  extends Model<BarraAttributes, BarraCreationAttributes>
  implements BarraAttributes
{
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
