import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface CitaAttributes {
  id: string;
  clienteId: string | null;
  barberoId: string;
  servicioId: string;
  fechaHora: Date;
  fechaFin: Date; // Usado solo a nivel de aplicación para lógica de disponibilidad
  estado: "pendiente" | "confirmada" | "cancelada" | "completada";

  precioFinal: number;
  duracionMinutos: number;
  notas?: string | null;

  nombreCliente?: string | null;
  emailCliente?: string | null;
  whatsappCliente?: string | null;
}

interface CitaCreationAttributes
  extends Optional<
    CitaAttributes,
    | "id"
    | "estado"
    | "precioFinal"
    | "duracionMinutos"
    | "notas"
    | "nombreCliente"
    | "emailCliente"
    | "whatsappCliente"
    | "fechaFin"
  > { }

class Cita
  extends Model<CitaAttributes, CitaCreationAttributes>
  implements CitaAttributes {
  public id!: string;
  public clienteId!: string | null;
  public barberoId!: string;
  public servicioId!: string;

  public fechaHora!: Date;
  public fechaFin!: Date;

  public estado!: "pendiente" | "confirmada" | "cancelada" | "completada";

  public precioFinal!: number;
  public duracionMinutos!: number;
  public notas!: string | null;

  public nombreCliente!: string | null;
  public emailCliente!: string | null;
  public whatsappCliente!: string | null;
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
      allowNull: false,
      field: "servicio_id",
    },

    fechaHora: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "fecha_hora",
    },
    // **FIX CLAVE:** Se define como VIRTUAL para resolver el error de TypeScript
    fechaFin: {
      type: DataTypes.VIRTUAL,
      // Opcionalmente, puedes añadir un getter si necesitas que esté disponible
      // get() {
      //     const fecha = this.getDataValue('fechaHora');
      //     const duracion = this.getDataValue('duracionMinutos');
      //     return fecha ? new Date(fecha.getTime() + duracion * 60000) : undefined;
      // }
    },

    estado: {
      type: DataTypes.ENUM(
        "pendiente",
        "confirmada",
        "cancelada",
        "completada"
      ),
      allowNull: false,
      defaultValue: "confirmada",
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

    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

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
  },
  {
    sequelize,
    modelName: "Cita",
    tableName: "citas",
    timestamps: true,
    paranoid: true,
  }
);

export default Cita;