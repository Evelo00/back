// src/websocket/socket.ts
import { Server as HTTPServer } from "http";
import { Server } from "socket.io";

export function initSocket(server: HTTPServer) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Cliente desconectado:", socket.id);
    });
  });

  return io;
}
