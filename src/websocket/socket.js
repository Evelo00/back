import { Server } from 'socket.io';

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL,
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('Cliente conectado por WebSocket:', socket.id);

        // Aquí puedes añadir lógica para unir usuarios a 'rooms'
        // Por ejemplo, al autenticar, el cliente podría enviar su ID de usuario o rol
        // socket.on('authenticate', (data) => {
        //   // Aquí podrías verificar el token JWT y unir al usuario a su 'room'
        //   socket.join(`user_${data.userId}`);
        //   socket.join(`role_${data.role}`);
        // });


        socket.on('disconnect', () => {
            console.log('Cliente desconectado por WebSocket:', socket.id);
        });
    });
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.IO no inicializado. Asegúrate de llamar a initSocket(server).');
    }
    return io;
};

export { initSocket, getIo };