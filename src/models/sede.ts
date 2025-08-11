import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../config/database.js";

interface SedeAttributes {
  id: string;
  nombre: string;
  direccion: string;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

type SedeCreationAttributes = Optional<SedeAttributes, "id" | "activo">;

export class Sede
  extends Model<SedeAttributes, SedeCreationAttributes>
  implements SedeAttributes
{
  public id!: string;
  public nombre!: string;
  public direccion!: string;
  public activo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Sede.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: { type: DataTypes.STRING, allowNull: false },
    direccion: { type: DataTypes.STRING, allowNull: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    tableName: "sedes",
    paranoid: true,
    timestamps: true,
  }
);
