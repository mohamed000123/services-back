import { connectDatabase } from "@/database/client";
import limiter from "@/config/rateLimiter";
import env from "@/config/env";
import cookieParser from "cookie-parser";
import express, { Express } from "express";
import helmet from "helmet";
import { languageMiddleware } from "@/middlewares/language.middleware";

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
app.set('trust proxy', 1);
app.use(limiter);
app.use(languageMiddleware);

app.use("/admin", adminRoutes);
app.use("/app/client", clientRouter);

const PORT: number = parseInt(env("PORT", "8000"), 10);

/* eslint-disable no-console */

// Initialize database connection
connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  const { disconnectDatabase }: { disconnectDatabase: () => Promise<void> } =
    await import("./database/client.js");
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  const { disconnectDatabase }: { disconnectDatabase: () => Promise<void> } =
    await import("./database/client.js");
  await disconnectDatabase();
  process.exit(0);
});
