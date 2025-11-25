import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app";
import { initSocket } from "./websocket/socket";
import { connectDB, sequelize } from "./config/database";
import { createSuperAdmin } from "./seed/create-superadmin";


const APP_PORT = Number(process.env.APP_PORT) || 3000;
const HOST = "0.0.0.0";
const server = createServer(app);

initSocket(server);

connectDB()
  .then(() => {
    sequelize
      .sync({ alter: true })
      .then(async () => {

        await createSuperAdmin();

        console.log("✅ Modelos sincronizados con la base de datos.");
        server.listen(APP_PORT, HOST, () => {
          console.log(`🚀 Servidor corriendo en http://${HOST}:${APP_PORT}`);
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