import type { Socket } from "socket.io";
import Jwt, { type JwtPayload } from "jsonwebtoken";
import env from "@/config/env";
import { AdministratorRole } from "@/database/generated/client";

interface AdminTokenPayload {
  id: string;
  email: string;
  role: AdministratorRole;
}

function parseCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) {return undefined;}
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) {continue;}
    const key = trimmed.slice(0, eq);
    if (key === name) {return decodeURIComponent(trimmed.slice(eq + 1));}
  }
  return undefined;
}

export function authenticateAdminSocket(
  socket: Socket,
  next: (err?: Error) => void,
): void {
  try {
    const rawCookie: string | undefined = socket.handshake.headers.cookie;
    const token: string | undefined = parseCookie(rawCookie, "sAAt");
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }
    const decoded = Jwt.verify(token, env("ADMIN_TOKEN_SECRET")) as AdminTokenPayload;
    if (
      decoded.role !== AdministratorRole.SUPER_ADMIN &&
      decoded.role !== AdministratorRole.ADMIN
    ) {
      next(new Error("Forbidden"));
      return;
    }
    socket.data.admin = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}

export function authenticateClientSocket(
  socket: Socket,
  next: (err?: Error) => void,
): void {
  try {
    let token: string | undefined =
      typeof socket.handshake.auth?.token === "string"
        ? socket.handshake.auth.token
        : undefined;
    if (!token) {
      const authHeader: string | undefined = socket.handshake.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }
    if (!token) {
      next(new Error("Unauthorized"));
      return;
    }
    const decoded = Jwt.verify(token, env("JWT_SECRET")) as JwtPayload & {
      clientId?: string;
    };
    const clientId: string | undefined = decoded.clientId;
    if (!clientId) {
      next(new Error("Unauthorized"));
      return;
    }
    socket.data.client = { id: clientId };
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}
