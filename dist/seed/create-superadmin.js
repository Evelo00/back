"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuperAdmin = void 0;
const user_1 = require("../models/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const ADMIN_CREDENTIALS = {
    email: 'admin@superbarber.com',
    password: 'SuperAdminPassword123',
    rol: 'superadmin',
    nombre: 'System',
    apellido: 'Admin'
};
const createSuperAdmin = async () => {
    try {
        console.log('🚀 Iniciando verificación y creación de Superadmin...');
        if (!database_1.sequelize.isDefined('User')) {
            console.log('🔴 Error: El modelo User no está definido en Sequelize. Asegúrate de que todos los modelos se hayan inicializado antes de llamar a este script.');
            return;
        }
        const existingAdmin = await user_1.User.findOne({ where: { email: ADMIN_CREDENTIALS.email } });
        if (existingAdmin) {
            console.log(`✅ Superadmin (${ADMIN_CREDENTIALS.email}) ya existe. Omitiendo creación.`);
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(ADMIN_CREDENTIALS.password, salt);
        const userData = {
            email: ADMIN_CREDENTIALS.email,
            rol: ADMIN_CREDENTIALS.rol,
            nombre: ADMIN_CREDENTIALS.nombre,
            apellido: ADMIN_CREDENTIALS.apellido,
            passwordHash: hashedPassword,
        };
        await user_1.User.create(userData);
        console.log(`🎉 Superadmin creado con éxito!`);
        console.log(`   - Correo: ${ADMIN_CREDENTIALS.email}`);
        console.log(`   - Contraseña: ${ADMIN_CREDENTIALS.password}`);
    }
    catch (error) {
        console.error('❌ Error fatal al crear el usuario Superadmin:', error);
    }
};
exports.createSuperAdmin = createSuperAdmin;
