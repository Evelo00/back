// src/server.ts
import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app";
import { connectDB, sequelize } from "./config/database";
import { initSocket } from "./websocket/socket";
import { createSuperAdmin } from "./seed/create-superadmin";

const PORT = Number(process.env.PORT) || 4000;
const HOST = "0.0.0.0";

// Crear servidor HTTP
const server = createServer(app);

// Inicializar WebSockets DESPUÉS de crear server
initSocket(server);

// ---------- Manejo global de errores ----------
process.on("uncaughtException", (err) => {
  console.error("❌ Error no capturado:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Promesa rechazada no manejada:", reason);
});

// ---------- Iniciar servidor ----------
const startHTTP = () => {
  server.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
  });
};

connectDB()
  .then(async () => {
    try {
      await sequelize.sync({ alter: false });
      await createSuperAdmin();

      console.log("✅ Modelos sincronizados correctamente.");
      startHTTP();
    } catch (syncErr) {
      console.error("❌ Error al sincronizar modelos:", syncErr);
      startHTTP(); // Mantener servicio arriba
    }
  })
  .catch((dbErr) => {
    console.error("❌ Error conectando a DB:", dbErr);
    startHTTP(); // El servidor sigue arriba aunque DB falle
  });
