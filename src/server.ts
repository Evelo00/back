import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import { createServer } from "http";
import app from "./app";
import { initSocket } from "./websocket/socket";
import { connectDB, sequelize } from "./config/database";
import { createSuperAdmin } from "./seed/create-superadmin";

const APP_PORT = Number(process.env.PORT) || Number(process.env.APP_PORT);
const HOST = "0.0.0.0";

const server = createServer(app);

initSocket(server);
console.log("ENV ->", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  pass: process.env.DB_PASSWORD,
});

const startServer = () => {
  server.listen(APP_PORT, HOST, () => {
    console.log(`🚀 Servidor corriendo en http://${HOST}:${APP_PORT}`);
  });
};

connectDB()
  .then(() => {
    sequelize
      .sync({ force: false })
      .then(async () => {
        await createSuperAdmin();

        console.log("✅ Modelos sincronizados con la base de datos.");
        startServer(); // Inicia el servidor después de la sincronización exitosa
      })
      .catch((err) => {
        console.error("❌ Error al sincronizar modelos o en seeds:", err);
        // Si la conexión funcionó pero la sincronización/seeds falló, es un error grave.
        process.exit(1);
      });
  })
  .catch((err) => {
    console.error(
      "❌ Error al conectar a la base de datos. Iniciando sin conexión a DB:",
      err
    );
    // 🔑 CAMBIO CLAVE: Llama a startServer() si la conexión a la DB falla.
    // Esto resuelve el 502 Bad Gateway de Seenode. Las rutas de la API que
    // dependan de la DB fallarán con error 500, pero el servicio estará "up".
    startServer();
  });