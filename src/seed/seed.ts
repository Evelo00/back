import { sequelize } from "../config/database";
import { User } from "../models/user";
import Service from "../models/service";
import bcrypt from "bcryptjs";

export async function seedAll() {
  try {
    console.log("🚀 Iniciando seed general...");

    // ----------------------
    // Servicios
    // ----------------------
    const services = [
      { nombre: "KIDS ESPECIAL", precio: 30000, duracion: 45 },
      { nombre: "CORTE KIDS", precio: 25000, duracion: 30 },
      { nombre: "CORTE BASICO", precio: 30000, duracion: 30 },
      { nombre: "BARBA", precio: 25000, duracion: 25 },
      { nombre: "BASICO + BARBA", precio: 50000, duracion: 50 },
      { nombre: "FACIAL", precio: 50000, duracion: 40 },
      { nombre: "CORTE BASICO + FACIAL", precio: 80000, duracion: 60 },
      { nombre: "CORTE BASICO + BARBA + FACIAL", precio: 100000, duracion: 80 },
      { nombre: "CEJAS BASICO", precio: 15000, duracion: 15 },
      { nombre: "CEJAS SEMI", precio: 30000, duracion: 20 },
      { nombre: "TINTE BARBA", precio: 40000, duracion: 30 },
      { nombre: "TINTE CABELLO", precio: 60000, duracion: 40 },
      { nombre: "CERA NARIZ", precio: 10000, duracion: 10 },
      { nombre: "CERA OIDOS", precio: 10000, duracion: 10 },
      { nombre: "CERA NARIZ + OIDO", precio: 20000, duracion: 15 },
      { nombre: "BARBA + FACIAL", precio: 75000, duracion: 50 },
      { nombre: "CORTE CON TIJERA", precio: 40000, duracion: 40 },
      { nombre: "CERQUILLOS", precio: 10000, duracion: 10 },
      { nombre: "CORTE TIJERA + FACIAL", precio: 90000, duracion: 70 },
    ];

    for (const s of services) {
      await Service.findOrCreate({
        where: { nombre: s.nombre },
        defaults: s,
      });
    }

    console.log("✅ Servicios cargados correctamente");

    // ----------------------
    // Contraseñas encriptadas
    // ----------------------
    const defaultPassword = await bcrypt.hash("123456", 10);
    const superAdminPassword = await bcrypt.hash("SuperAdminPassword123", 10);

    // ----------------------
    // Barberos
    // ----------------------
    const barberos = [
      { email: "juan@barberia.com", nombre: "Juan", apellido: "Pérez", rol: "barbero", passwordHash: defaultPassword },
      { email: "carlos@barberia.com", nombre: "Carlos", apellido: "Ramírez", rol: "barbero", passwordHash: defaultPassword },
      { email: "andres@barberia.com", nombre: "Andrés", apellido: "Gómez", rol: "barbero", passwordHash: defaultPassword },
      { email: "luis@barberia.com", nombre: "Luis", apellido: "Martínez", rol: "barbero", passwordHash: defaultPassword },
      { email: "felipe@barberia.com", nombre: "Felipe", apellido: "Torres", rol: "barbero", passwordHash: defaultPassword },
      { email: "jorge@barberia.com", nombre: "Jorge", apellido: "Castro", rol: "barbero", passwordHash: defaultPassword },
      { email: "mateo@barberia.com", nombre: "Mateo", apellido: "Hernández", rol: "barbero", passwordHash: defaultPassword },
    ];

    for (const b of barberos) {
      const [user, created] = await User.findOrCreate({
        where: { email: b.email },
        defaults: b as any,
      });

      if (!created) {
        console.log(`El barbero ${b.nombre} ya existe, no se duplicó.`);
      }
    }

    console.log("✅ Barberos cargados correctamente");

    // ----------------------
    // Superadmin
    // ----------------------
    const superAdminData = {
      email: "admin@superbarber.com",
      nombre: "System",
      apellido: "Admin",
      rol: "superadmin",
      passwordHash: superAdminPassword,
    };

    await User.findOrCreate({
      where: { email: superAdminData.email },
      defaults: superAdminData as any,
    });

    console.log("✅ Superadmin creado o ya existente");

    // ----------------------
    // Usuarios de prueba (clientes y caja)
    // ----------------------
    const usuarios = [
      // Caja
      { email: "caja@barberia.com", nombre: "Laura", apellido: "Gómez", rol: "caja", passwordHash: defaultPassword, activo: true },
      // Clientes
      { email: "cliente1@example.com", nombre: "Ana", apellido: "Martínez", rol: "cliente", passwordHash: defaultPassword, activo: true },
      { email: "cliente2@example.com", nombre: "Luis", apellido: "Torres", rol: "cliente", passwordHash: defaultPassword, activo: true },
    ];

    for (const u of usuarios) {
      await User.findOrCreate({
        where: { email: u.email },
        defaults: u as any,
      });
    }

    console.log("✅ Usuarios de prueba cargados correctamente");

    console.log("🎉 Seed general completado!");
  } catch (error) {
    console.error("❌ Error en seed general:", error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar directamente si se llama desde la terminal
if (require.main === module) {
  seedAll();
}
