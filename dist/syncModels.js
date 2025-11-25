import { sequelize } from "../src/config/database.js";
import "../src/models/barra.js";
import "../src/models/UserBase.js";
import "../src/models/Service.js";
import "../src/models/ProductoNevera.js";
import "../src/models/VitrinaCounter.js";
import "../src/models/Sede.js";
import "../src/models/User.js";
import "../src/models/Venta.js";
import "../src/models/detalleVenta.js";
import "../src/models/citas.js";

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