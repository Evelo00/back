import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app.js";
import { initSocket } from "./websocket/socket.js";
import { connectDB, sequelize } from "./config/database.js";

const APP_PORT = process.env.APP_PORT || 3000;
const server = createServer(app);

initSocket(server);

connectDB()
  .then(() => {
    sequelize
      .sync({ alter: true })
      .then(() => {
        console.log("✅ Modelos sincronizados con la base de datos.");
        server.listen(APP_PORT, () => {
          console.log(`🚀 Servidor corriendo en http://localhost:${APP_PORT}`);
        });
      })
      .catch((err) => {
        console.error("❌ Error al sincronizar modelos:", err);
        process.exit(1);
      });
  })
  .catch((err) => {
    console.error("❌ Error al conectar a la base de datos:", err);
    process.exit(1);
  });
