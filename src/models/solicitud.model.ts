import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from "sequelize";
import { sequelize } from "../config/database";

export class SolicitudCaja extends Model<
  InferAttributes<SolicitudCaja>,
  InferCreationAttributes<SolicitudCaja>
> {
  declare id: CreationOptional<string>;
  declare barberoId: string;
  declare tipo: string;
  declare descripcion: string;
  declare estado: string;
}

SolicitudCaja.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    barberoId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "barbero_id",
    },
    tipo: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    estado: {
      type: DataTypes.ENUM("pendiente", "aprobado", "rechazado"),
      defaultValue: "pendiente",
    },
  },
  {
    sequelize,
    tableName: "solicitudes_caja",
  }
);
