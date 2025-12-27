import {
  Model,
  DataTypes,
  Optional,
} from "sequelize";
import { sequelize } from "../config/database";

interface ClienteAttributes {
  id: string;
  nombre: string;
  telefono: string;
  email?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface ClienteCreationAttributes
  extends Optional<
    ClienteAttributes,
    "id" | "email" | "createdAt" | "updatedAt" | "deletedAt"
  > {}

class Cliente
  extends Model<ClienteAttributes, ClienteCreationAttributes>
  implements ClienteAttributes
{
  public id!: string;
  public nombre!: string;
  public telefono!: string;
  public email!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Cliente.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    nombre: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "clientes",
    modelName: "Cliente",

    timestamps: true,
    paranoid: true,

    underscored: true,
  }
);

export default Cliente;
