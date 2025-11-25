import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import apiRoutes from "./routes/index";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
