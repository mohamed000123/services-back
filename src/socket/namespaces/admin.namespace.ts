import type { Server as IOServer } from "socket.io";
import { authenticateAdminSocket } from "@/socket/auth.middleware";

const ADMIN_NS = "/realtime/admin";

export function registerAdminNamespace(io: IOServer): void {
  const nsp = io.of(ADMIN_NS);
  nsp.use(authenticateAdminSocket);

  nsp.on("connection", async (socket) => {
    await socket.join("admins");
    const count: number = nsp.adapter.rooms.get("admins")?.size ?? 0;
    nsp.to("admins").emit("presence:admins", { count });

    socket.on("join_request", (requestId: string) => {
      if (typeof requestId === "string" && requestId.length > 0) {
        void socket.join(`request:${requestId}`);
      }
    });

    socket.on("leave_request", (requestId: string) => {
      if (typeof requestId === "string" && requestId.length > 0) {
        void socket.leave(`request:${requestId}`);
      }
    });

    socket.on("ping_health", (cb: (p: { ok: boolean }) => void) => {
      if (typeof cb === "function") {cb({ ok: true });}
    });

    socket.on("disconnect", () => {
      const after: number = nsp.adapter.rooms.get("admins")?.size ?? 0;
      nsp.to("admins").emit("presence:admins", { count: after });
    });
  });
}
