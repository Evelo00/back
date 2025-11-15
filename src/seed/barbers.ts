import { User } from "../models/user";
import bcrypt from "bcryptjs";

export async function seedBarbers() {
  const password = await bcrypt.hash("123456", 10);

  const barberos = [
    { email: "juan@barberia.com", nombre: "Juan", apellido: "Pérez", rol: "barbero", passwordHash: password },
    { email: "carlos@barberia.com", nombre: "Carlos", apellido: "Ramírez", rol: "barbero", passwordHash: password },
    { email: "andres@barberia.com", nombre: "Andrés", apellido: "Gómez", rol: "barbero", passwordHash: password },
    { email: "luis@barberia.com", nombre: "Luis", apellido: "Martínez", rol: "barbero", passwordHash: password },
    { email: "felipe@barberia.com", nombre: "Felipe", apellido: "Torres", rol: "barbero", passwordHash: password },
    { email: "jorge@barberia.com", nombre: "Jorge", apellido: "Castro", rol: "barbero", passwordHash: password },
    { email: "mateo@barberia.com", nombre: "Mateo", apellido: "Hernández", rol: "barbero", passwordHash: password },
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

  console.log("✅ Barberos revisados y creados correctamente!");
}

// Ejecutar directamente si se corre este archivo
if (require.main === module) {
  (async () => {
    try {
      await seedBarbers();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}
