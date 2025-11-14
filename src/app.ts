import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import citaRoutes from "./routes/cita.routes.js";
import ventaRoutes from "./routes/venta.routes.js";
import detalleVentaRoutes from "./routes/detalleVenta.routes.js";
import productoNeveraRoutes from "./routes/productoNevera.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import vitrinaCounterRoutes from "./routes/vitrinaCounter.routes.js";
import barraRoutes from "./routes/barra.routes.js";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Cambiar por la URL del front
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(morgan("dev"));

app.use("/users", userRoutes);
app.use("/citas", citaRoutes);
app.use("/ventas", ventaRoutes);
app.use("/detalles-venta", detalleVentaRoutes);
app.use("/productos-nevera", productoNeveraRoutes);
app.use("/services", serviceRoutes);
app.use("/vitrina-counter", vitrinaCounterRoutes);
app.use("/barras", barraRoutes);
app.use("/api", routes);
app.use("/auth", authRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("✅ API de Barbería funcionando!");
});

export default app;
