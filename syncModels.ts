import { sequelize } from "./src/config/database";
import "./src/models/barra";
import "./src/models/UserBase";
import "./src/models/service";
import "./src/models/productoNevera";
import "./src/models/vitrinaCounter";
import "./src/models/sede";
import "./src/models/user";
import "./src/models/venta";
import "./src/models/detalleVenta";
import "./src/models/citas";

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Modelos sincronizados con la base de datos");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al sincronizar la base de datos:", error);
    process.exit(1);
  }
})();
