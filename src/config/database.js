import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false
    // }
    },
});
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexión a la base de datos PostgreSQL establecida correctamente.");
    }
    catch (error) {
        console.error("❌ No se pudo conectar a la base de datos:", error);
    }
};
export { connectDB, sequelize };
//# sourceMappingURL=database.js.map