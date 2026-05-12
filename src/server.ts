import { createServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import type { Server as IOServer } from "socket.io";
import { connectDatabase, disconnectDatabase } from "@/database/client";
import limiter from "@/config/rateLimiter";
import env from "@/config/env";
import cookieParser from "cookie-parser";
import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { languageMiddleware } from "@/middlewares/language.middleware";
import { initSocketIO, shutdownSocketIO } from "@/socket";

//Routes
import adminRoutes from "@/routes/admin/router";
import clientRouter from "@/routes/app/client/clientRouter";

const app: Express = express();

app.use(helmet());
app.use(express.json({ limit: env("REQUEST_LIMIT", "10mb") }));
app.use(
  express.urlencoded({
    limit: env("REQUEST_LIMIT", "10mb"),
    extended: true,
  }),
);
app.use(cookieParser());
app.set("trust proxy", 1);
app.use(limiter);
app.use(languageMiddleware);

app.use("/admin", adminRoutes);
app.use("/app/client", clientRouter);

/**
 * JSON errors for middleware `next({ status, message })` (e.g. adminGuard).
 * Without this, Express responds with default HTML ("Forbidden"), which breaks SPA parsing.
 */
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const e = err as { status?: number; statusCode?: number; message?: string };
  const raw =
    typeof e.status === "number"
      ? e.status
      : typeof e.statusCode === "number"
        ? e.statusCode
        : undefined;
  const status =
    typeof raw === "number" && raw >= 400 && raw < 600 ? raw : 500;
  const message =
    typeof e.message === "string" && e.message.length > 0 ? e.message : "Error";
  if (!res.headersSent) {
    res.status(status).json({ message });
  }
});

const PORT: number = parseInt(env("PORT", "8000"), 10);

/* eslint-disable no-console */

let httpServer: HttpServer | null = null;
let ioServer: IOServer | null = null;

// Initialize database connection
connectDatabase()
  .then(() => {
    httpServer = createServer(app);
    ioServer = initSocketIO(httpServer);
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`${signal} received: shutting down`);
  shutdownSocketIO(ioServer);
  ioServer = null;
  if (httpServer) {
    await new Promise<void>((resolve, reject) => {
      httpServer!.close((err) => (err ? reject(err) : resolve()));
    });
    httpServer = null;
  }
  await disconnectDatabase();
  process.exit(0);
}

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});
