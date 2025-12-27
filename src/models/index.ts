import { sequelize as sequelizeConnection } from "../config/database";

import { User } from "./user";
import { Sede } from "./sede";
import Venta from "./venta";
import Service from "./service";
import Cita from "./citas";       // ← OJO: usar export nombrado
import { SolicitudCaja } from "./solicitud.model";
import CitaServicio from "./citaServicio";
import Cliente from "./cliente";

Sede.hasMany(User, {
  foreignKey: "sedeId",
  as: "usuarios",
});
User.belongsTo(Sede, {
  foreignKey: "sedeId",
  as: "sede",
});

User.hasMany(Venta, {
  foreignKey: "usuarioId",
  as: "ventas",
});
Venta.belongsTo(User, {
  foreignKey: "usuarioId",
  as: "usuario",
});

User.hasMany(Venta, {
  foreignKey: "clienteId",
  as: "comprasCliente",
});
Venta.belongsTo(User, {
  foreignKey: "clienteId",
  as: "cliente",
});

User.hasMany(Cita, {
  foreignKey: "barberoId",
  as: "citasBarbero",
});
Cita.belongsTo(User, {
  foreignKey: "barberoId",
  as: "barberoCita",
});

User.hasMany(SolicitudCaja, {
  foreignKey: "barberoId",
  as: "solicitudesCaja",
});
SolicitudCaja.belongsTo(User, {
  foreignKey: "barberoId",
  as: "barberoSolicitud",
});

Cita.hasMany(CitaServicio, {
  foreignKey: "citaId",
  as: "servicios",
});

CitaServicio.belongsTo(Cita, {
  foreignKey: "citaId",
  as: "cita",
});

Service.hasMany(CitaServicio, {
  foreignKey: "servicioId",
  as: "citas",
});

CitaServicio.belongsTo(Service, {
  foreignKey: "servicioId",
  as: "servicio",
});

Cliente.hasMany(Cita, {
  foreignKey: "clienteId",
  as: "citasCliente",
});

Cita.belongsTo(Cliente, {
  foreignKey: "clienteId",
  as: "cliente",
});

export {
  sequelizeConnection,
  User,
  Sede,
  Venta,
  Service,
  Cita,
  SolicitudCaja,
};
