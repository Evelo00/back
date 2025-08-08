import { sequelize } from "./src/config/database.js";
import "./src/models/barbero.js";
import "./src/models/client.js";
import "./src/models/barra.js";
import "./src/models/UserBase.js";
import "./src/models/superAdmin.js";
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