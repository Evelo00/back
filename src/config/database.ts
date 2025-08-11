import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbHost: string = process.env.DB_HOST || "";
const dbName: string = process.env.DB_NAME || "";
const dbUser: string = process.env.DB_USER || "";
const dbPassword: string = process.env.DB_PASSWORD || "";

if (!dbHost) throw new Error("DB_HOST environment variable is not set");
if (!dbName) throw new Error("DB_NAME environment variable is not set");
if (!dbUser) throw new Error("DB_USER environment variable is not set");

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: "postgres",
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
    paranoid: true,
  },
});

const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log(
      "✅ Conexión a la base de datos PostgreSQL establecida correctamente."
    );
  } catch (error) {
    console.error("❌ No se pudo conectar a la base de datos:", error);
    process.exit(1);
  }
};

export { connectDB, sequelize };
