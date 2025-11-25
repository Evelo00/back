"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.connectDB = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbHost = process.env.DB_HOST || "";
const dbName = process.env.DB_NAME || "";
const dbUser = process.env.DB_USER || "";
const dbPassword = process.env.DB_PASSWORD || "";
if (!dbHost)
    throw new Error("DB_HOST environment variable is not set");
if (!dbName)
    throw new Error("DB_NAME environment variable is not set");
if (!dbUser)
    throw new Error("DB_USER environment variable is not set");
const sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: "postgres",
    logging: false,
    define: {
        underscored: true,
        timestamps: true,
        paranoid: true,
    },
});
exports.sequelize = sequelize;
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexión a la base de datos PostgreSQL establecida correctamente.");
    }
    catch (error) {
        console.error("❌ No se pudo conectar a la base de datos:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
