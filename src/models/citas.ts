// models/cita.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";

interface CitaAttributes {
  id: string;
  clienteId: string;
  barberoId: string;
  servicioId: string;
  fechaHora: Date;
  estado: "pendiente" | "confirmada" | "cancelada" | "completada";

  precioFinal: number;
  duracionMinutos: number;
  notas?: string | null;
}

interface CitaCreationAttributes
  extends Optional<
    CitaAttributes,
    "id" | "estado" | "precioFinal" | "duracionMinutos" | "notas"
  > {}

class Cita
  extends Model<CitaAttributes, CitaCreationAttributes>
  implements CitaAttributes
{
  public id!: string;
  public clienteId!: string;
  public barberoId!: string;
  public servicioId!: string;
  public fechaHora!: Date;
  public estado!: "pendiente" | "confirmada" | "cancelada" | "completada";

  public precioFinal!: number;
  public duracionMinutos!: number;
  public notas!: string | null;
}

Cita.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clienteId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    barberoId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    servicioId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    fechaHora: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(
        "pendiente",
        "confirmada",
        "cancelada",
        "completada"
      ),
      allowNull: false,
      defaultValue: "pendiente",
    },

    precioFinal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    duracionMinutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },

    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Cita",
    tableName: "citas",
    timestamps: true,
  }
);

export default Cita;
