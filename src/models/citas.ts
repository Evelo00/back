import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from "sequelize";
import { sequelize } from "../config/database";

export class Cita extends Model<
  InferAttributes<Cita>,
  InferCreationAttributes<Cita>
> {
  declare id: CreationOptional<string>;
  declare clienteId: string | null;
  declare barberoId: string;
  declare servicioId: string | null;
  declare fechaHora: Date;
  declare fechaFin: Date;
  declare estado: "pendiente" | "confirmada" | "cancelada" | "completada" | "bloqueo";
  declare precioFinal: number;
  declare duracionMinutos: number;
  declare notas: string | null;
  declare nombreCliente: string | null;
  declare emailCliente: string | null;
  declare whatsappCliente: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: Date | null;
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
      allowNull: true,
      field: "cliente_id",
    },
    barberoId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "barbero_id",
    },
    servicioId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "servicio_id",
    },
    fechaHora: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "fecha_hora",
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "fecha_fin",
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "confirmada", "cancelada", "completada", "bloqueo"),
      defaultValue: "confirmada",
      allowNull: false,
    },
    precioFinal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "precio_final",
    },
    duracionMinutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      field: "duracion_minutos",
    },
    notas: { type: DataTypes.TEXT, allowNull: true },
    nombreCliente: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "nombre_cliente",
    },
    emailCliente: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "email_cliente",
    },
    whatsappCliente: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "whatsapp_cliente",
    },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
    deletedAt: { type: DataTypes.DATE, field: "deleted_at" },
  },
  {
    sequelize,
    tableName: "citas",
    paranoid: true,
    timestamps: true,
  }
);

export default Cita;
