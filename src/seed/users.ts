import { User } from "../models/User";
import bcrypt from "bcryptjs";

export async function seedUsers() {
  const defaultPassword = await bcrypt.hash("123456", 10);

  const usuarios = [
    // Superadmin
    {
      email: "admin@barberia.com",
      nombre: "Admin",
      apellido: "Principal",
      rol: "superadmin",
      passwordHash: defaultPassword,
      activo: true,
    },
    // Caja
    {
      email: "caja@barberia.com",
      nombre: "Laura",
      apellido: "Gómez",
      rol: "caja",
      passwordHash: defaultPassword,
      activo: true,
    },
    // Barberos
    {
      email: "juan@barberia.com",
      nombre: "Juan",
      apellido: "Pérez",
      rol: "barbero",
      passwordHash: defaultPassword,
      telefono: "3101234567",
      activo: true,
    },
    {
      email: "carlos@barberia.com",
      nombre: "Carlos",
      apellido: "Ramírez",
      rol: "barbero",
      passwordHash: defaultPassword,
      telefono: "3107654321",
      activo: true,
    },
    {
      email: "andres@barberia.com",
      nombre: "Andrés",
      apellido: "Gómez",
      rol: "barbero",
      passwordHash: defaultPassword,
      telefono: "3111234567",
      activo: true,
    },
    // Clientes
    {
      email: "cliente1@example.com",
      nombre: "Ana",
      apellido: "Martínez",
      rol: "cliente",
      passwordHash: defaultPassword,
      telefono: "3121112233",
      activo: true,
    },
    {
      email: "cliente2@example.com",
      nombre: "Luis",
      apellido: "Torres",
      rol: "cliente",
      passwordHash: defaultPassword,
      telefono: "3124445566",
      activo: true,
    },
  ];

  await User.bulkCreate(usuarios as unknown as any);
  console.log("Usuarios seed completado!");
}
