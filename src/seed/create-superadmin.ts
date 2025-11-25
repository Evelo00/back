import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';

const ADMIN_CREDENTIALS = {
    email: 'admin@superbarber.com',
    password: 'SuperAdminPassword123',
    rol: 'superadmin',
    nombre: 'System',
    apellido: 'Admin'
};

export const createSuperAdmin = async () => {
    try {
        console.log('🚀 Iniciando verificación y creación de Superadmin...');

        if (!sequelize.isDefined('User')) {
            console.log('🔴 Error: El modelo User no está definido en Sequelize. Asegúrate de que todos los modelos se hayan inicializado antes de llamar a este script.');
            return;
        }

        const existingAdmin = await User.findOne({ where: { email: ADMIN_CREDENTIALS.email } });

        if (existingAdmin) {
            console.log(`✅ Superadmin (${ADMIN_CREDENTIALS.email}) ya existe. Omitiendo creación.`);
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, salt);

        const userData = {
            email: ADMIN_CREDENTIALS.email,
            rol: ADMIN_CREDENTIALS.rol,
            nombre: ADMIN_CREDENTIALS.nombre,
            apellido: ADMIN_CREDENTIALS.apellido,
            passwordHash: hashedPassword,
        };

        await User.create(userData as any);

        console.log(`🎉 Superadmin creado con éxito!`);
        console.log(`   - Correo: ${ADMIN_CREDENTIALS.email}`);
        console.log(`   - Contraseña: ${ADMIN_CREDENTIALS.password}`);

    } catch (error) {
        console.error('❌ Error fatal al crear el usuario Superadmin:', error);
    }
};