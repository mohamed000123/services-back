import type { Server as IOServer } from "socket.io";

let ioServer: IOServer | null = null;

/**
 * Called once from `initSocketIO` after HTTP server starts.
 * Remains null in tests or before boot — all emit helpers no-op safely.
 */
export function setSocketIOServer(server: IOServer | null): void {
  ioServer = server;
}

const ADMIN_NS = "/realtime/admin";
const CLIENT_NS = "/realtime/client";

export type RequestRealtimePayload = Record<string, unknown>;

export function emitRequestCreated(payload: RequestRealtimePayload): void {
  if (!ioServer) {return;}
  ioServer.of(ADMIN_NS).to("admins").emit("request:created", payload);
}

export function emitRequestStatusChanged(payload: RequestRealtimePayload): void {
  if (!ioServer) {return;}
  ioServer.of(ADMIN_NS).to("admins").emit("request:status_changed", payload);
  const clientId = payload.clientId;
  if (typeof clientId === "string" && clientId.length > 0) {
    ioServer.of(CLIENT_NS).to(`client:${clientId}`).emit("request:status_changed", payload);
  }
}

export function emitRequestUpdated(payload: RequestRealtimePayload): void {
  if (!ioServer) {return;}
  ioServer.of(ADMIN_NS).to("admins").emit("request:updated", payload);
}

export function emitRequestDeleted(payload: RequestRealtimePayload): void {
  if (!ioServer) {return;}
  ioServer.of(ADMIN_NS).to("admins").emit("request:deleted", payload);
}

export function broadcastPresenceAdmins(count: number): void {
  if (!ioServer) {return;}
  ioServer.of(ADMIN_NS).to("admins").emit("presence:admins", { count });
}
