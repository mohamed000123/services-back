import type { Server as IOServer } from "socket.io";
import { authenticateClientSocket } from "@/socket/auth.middleware";

const CLIENT_NS = "/realtime/client";

export function registerClientNamespace(io: IOServer): void {
  const nsp = io.of(CLIENT_NS);
  nsp.use(authenticateClientSocket);

  nsp.on("connection", (socket) => {
    const clientId: string | undefined = socket.data.client?.id;
    if (clientId) {
      void socket.join(`client:${clientId}`);
    }
  });
}
