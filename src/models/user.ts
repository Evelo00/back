import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../config/database.js";

type RolUsuario = "superadmin" | "caja" | "barbero" | "cliente";

interface UsuarioAttributes {
  id: string;
  email: string;
  telefono?: string;
  passwordHash: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type UsuarioCreationAttributes = Optional<UsuarioAttributes, "id" | "activo">;

export class User
  extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes
{
  public id!: string;
  public email!: string;
  public telefono?: string;
  public passwordHash!: string;
  public nombre!: string;
  public apellido!: string;
  public rol!: RolUsuario;
  public activo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    telefono: { type: DataTypes.STRING },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    nombre: { type: DataTypes.STRING, allowNull: false },
    apellido: { type: DataTypes.STRING, allowNull: false },
    rol: {
      type: DataTypes.ENUM("superadmin", "caja", "barbero", "cliente"),
      allowNull: false,
    },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    tableName: "usuarios",
    paranoid: true,
    timestamps: true,
    indexes: [{ fields: ["rol"] }, { unique: true, fields: ["email"] }],
  }
);
