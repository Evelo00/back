import { sequelize } from "./src/config/database.js";
import "./src/models/barra.js";
import "./src/models/UserBase.js";
import "./src/models/service.js";
import "./src/models/productoNevera.js";
import "./src/models/vitrinaCounter.js";
import "./src/models/sede.js";
import "./src/models/user.js";
import "./src/models/venta.js";
import "./src/models/detalleVenta.js";
import "./src/models/citas.js";
(async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("✅ Modelos sincronizados con la base de datos");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error al sincronizar la base de datos:", error);
        process.exit(1);
    }
})();
//# sourceMappingURL=syncModels.js.map