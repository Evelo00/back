import { Request, Response } from "express";
import Cita from "../models/citas.js";
import Service from "../models/service.js";
import { Op } from "sequelize";
import { SolicitudCaja } from "../models/solicitud.model.js";

export const obtenerMisCitas = async (req: any, res: Response) => {
  try {
    const barberoId = req.user.id;

    const citas = await Cita.findAll({
      where: { barberoId },
      order: [["fechaHora", "ASC"]],
      include: [
        { model: Service, as: "servicioCita" },
        { model: (Cita as any).sequelize?.models.User || Cita.sequelize!.models.User, as: "clienteCita" },
      ],
    });

    return res.json(citas);
  } catch (error) {
    console.error("❌ ERROR obtenerMisCitas:", error);
    return res.status(500).json({ message: "Error al obtener citas" });
  }
};

export const obtenerGananciasSemana = async (req: any, res: Response) => {
  try {
    const barberoId = req.user.id;

    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());

    const finalSemana = new Date(inicioSemana);
    finalSemana.setDate(inicioSemana.getDate() + 6);

    const citas = await Cita.findAll({
      where: {
        barberoId,
        fechaHora: { [Op.between]: [inicioSemana, finalSemana] },
      },
    });

    const total = citas.reduce((sum, cita) => sum + (cita.precioFinal || 0), 0);

    return res.json({ total, citas });
  } catch (error) {
    console.error("❌ ERROR obtenerGananciasSemana:", error);
    return res.status(500).json({ message: "Error al obtener ganancias" });
  }
};

export const crearSolicitudCaja = async (req: any, res: Response) => {
  try {
    const barberoId = req.user.id;
    const { tipo, descripcion } = req.body;

    const nueva = await SolicitudCaja.create({
      barberoId,
      tipo,
      descripcion,
      estado: "pendiente",
    });

    return res.json(nueva);
  } catch (error) {
    console.error("❌ ERROR crearSolicitudCaja:", error);
    return res.status(500).json({ message: "Error al crear solicitud" });
  }
};
