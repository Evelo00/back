import { seedServices } from "./services";
import { seedUsers } from "./users";

async function seedAll() {
  await seedServices(); // servicios de barbería
  await seedUsers();    // seed de usuarios

  console.log("Todos los seeds completados!");
}

seedAll().catch(console.error);
