import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database";

export class CitaServicio extends Model<
  InferAttributes<CitaServicio>,
  InferCreationAttributes<CitaServicio>
> {
  declare id: CreationOptional<string>;
  declare citaId: string;
  declare servicioId: string;
  declare precio: number;
  declare duracion: number;
}

CitaServicio.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    citaId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "cita_id",
    },

    servicioId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "servicio_id",
    },

    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    duracion: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "cita_servicios",
    timestamps: false,
  }
);

export default CitaServicio;
