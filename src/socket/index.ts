import type { Server as IOServer } from "socket.io";
import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import env from "@/config/env";
import { setSocketIOServer } from "@/services/shared/realtime.emitter";
import { registerAdminNamespace } from "@/socket/namespaces/admin.namespace";
import { registerClientNamespace } from "@/socket/namespaces/client.namespace";

/**
 * Attach Socket.io to the same HTTP server as Express.
 */
export function initSocketIO(httpServer: HttpServer): IOServer {
  const io = new Server(httpServer, {
    path: env("SOCKET_PATH", "/socket.io"),
    cors: {
      origin: true,
      credentials: true,
    },
  });

  setSocketIOServer(io);
  registerAdminNamespace(io);
  registerClientNamespace(io);
  return io;
}

export function shutdownSocketIO(io: IOServer | null): void {
  if (!io) {
    return;
  }
  setSocketIOServer(null);
  io.close();
}
