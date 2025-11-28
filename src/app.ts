// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.routes";
import apiRoutes from "./routes/index";
import seedRoutes from "./routes/seed.routes";

// Inicializar app
const app = express();

// Cargar orígenes permitidos
const allowedOrigins = process.env.FRONTEND_URL?.split(",") || [];

// Middlewares principales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos públicos
app.use("/public", express.static(path.join(__dirname, "../public")));

// ------------- CORS FLEXIBLE Y SEGURO -------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir mobile (sin origin)
      if (!origin) return callback(null, true);

      // Normalizar (evitar https/http duplicados)
      const cleanOrigin = origin.replace(/\/$/, "");

      const isAllowed = allowedOrigins.some((o) =>
        cleanOrigin.includes(o.replace(/\/$/, "")),
      );

      if (isAllowed) return callback(null, true);
      return callback(new Error(`CORS: Origen no permitido: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ------------- HELMET PARA API / SOCKETS -------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

// Logs de peticiones
app.use(morgan("dev"));

// ------------- RUTAS -------------
app.use("/auth", authRoutes); 
app.use("/api", apiRoutes);

app.get("/", (_req, res) => {
  res.send("✅ API de Barbería funcionando!");
});

export default app;
