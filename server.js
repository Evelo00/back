import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'http';
import app from './src/app.js';
import { initSocket } from './src/websocket/socket.js';
import { connectDB, sequelize } from './src/config/database.js';

const DB_PORT = process.env.DB_PORT || 5432;
const server = createServer(app);

initSocket(server);

connectDB().then(() => {
    sequelize.sync({ alter: true })
        .then(() => {
            console.log('Modelos sincronizados con la base de datos.');
            server.listen(DB_PORT, () => {
                console.log(`Servidor corriendo en http://localhost:${DB_PORT}`);
            });
        })
        .catch(err => {
            console.error('Error al sincronizar modelos:', err);
            process.exit(1);
        });
}).catch(err => {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
});