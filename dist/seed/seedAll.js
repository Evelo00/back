"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("./services");
const users_1 = require("./users");
async function seedAll() {
    await (0, services_1.seedServices)(); // servicios de barbería
    await (0, users_1.seedUsers)(); // seed de usuarios
    console.log("Todos los seeds completados!");
}
seedAll().catch(console.error);
