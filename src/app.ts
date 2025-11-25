import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import apiRoutes from "./routes/index";
import seedRoutes from "./routes/seed.routes";

const app = express();
const allowedOrigins = process.env.FRONTEND_URL?.split(",") || [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origen no permitido por CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));

// ---------- RUTAS LIMPIAS ----------
app.use("/auth", authRoutes);    // Login / Register
app.use("/api", apiRoutes);      // Todo lo demás

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ API de Barbería funcionando!");
});

export default app;
