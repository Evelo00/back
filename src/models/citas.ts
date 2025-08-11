// models/cita.ts
import { DataTypes, Model, type Optional } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./user.js";
import Service from "./service.js";

interface CitaAttributes {
  id: string;
  clienteId: string;
  barberoId: string;
  servicioId: string;
  fechaHora: Date;
  estado: "pendiente" | "confirmada" | "cancelada" | "completada";
}

interface CitaCreationAttributes
  extends Optional<CitaAttributes, "id" | "estado"> {}

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
  },
  {
    sequelize,
    modelName: "Cita",
    tableName: "citas",
    timestamps: true,
  }
);

// Relaciones
Cita.belongsTo(User, { as: "cliente", foreignKey: "clienteId" });
Cita.belongsTo(User, { as: "barbero", foreignKey: "barberoId" });
Cita.belongsTo(Service, { as: "servicio", foreignKey: "servicioId" });

export default Cita;
