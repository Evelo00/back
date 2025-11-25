"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = exports.connectDB = void 0;
const sequelize_1 = require("sequelize");
// import dotenv from "dotenv";
// if (process.env.NODE_ENV !== "production") {
//   dotenv.config();
// }
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = Number(process.env.DB_PORT || 5432);
console.log("DB CONFIG ->", { dbHost, dbPort, dbUser, dbName });
if (!dbHost)
    throw new Error("DB_HOST no está definido");
if (!dbName)
    throw new Error("DB_NAME no está definido");
if (!dbUser)
    throw new Error("DB_USER no está definido");
const sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: "postgres",
    logging: false,
    define: {
        underscored: true,
        timestamps: true,
        paranoid: true,
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});
exports.sequelize = sequelize;
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conexión a PostgreSQL establecida correctamente.");
    }
    catch (error) {
        console.error("❌ No se pudo conectar a la base de datos:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
