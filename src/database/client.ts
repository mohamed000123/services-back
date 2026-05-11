import { PrismaClient } from "@/database/generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import logger from "@/config/logger";
import env from "@/config/env";

/**
 * Create MySQL connection adapter for Prisma
 * Prisma 7 with custom output requires an adapter when using the "client" engine type
 */
const connectionString: string = env("DATABASE_URL");
const adapter: PrismaMariaDb = new PrismaMariaDb(connectionString);

/**
 * Prisma Client Instance
 *
 * This is a singleton instance of PrismaClient that should be used throughout the application.
 * It handles connection pooling and provides type-safe database access.
 *
 * Note: Prisma 7 with custom output path generates a "client" engine type that requires an adapter.
 */
const prisma: PrismaClient = new PrismaClient({
  adapter,
  log:
    env("NODE_ENV") === "production"
      ? ["error", "warn"]
      : [
          { emit: "event", level: "query" },
          { emit: "event", level: "error" },
          { emit: "event", level: "info" },
          { emit: "event", level: "warn" },
        ],
  errorFormat: "pretty",
});

// Log Prisma queries in development
// if (process.env.NODE_ENV !== "production") {
//   // Type assertion needed due to Prisma's strict typing
//   (prisma as any).$on(
//     "query",
//     (e: { query: string; params: string; duration: number }) => {
//       logger.debug("Prisma Query", {
//         query: e.query,
//         params: e.params,
//         duration: `${e.duration}ms`,
//       });
//     }
//   );

//   (prisma as any).$on("error", (e: { message: string; target: string }) => {
//     logger.error("Prisma Error", {
//       message: e.message,
//       target: e.target,
//     });
//   });

//   (prisma as any).$on("info", (e: { message: string; target: string }) => {
//     logger.info("Prisma Info", {
//       message: e.message,
//     });
//   });

//   (prisma as any).$on("warn", (e: { message: string; target: string }) => {
//     logger.warn("Prisma Warning", {
//       message: e.message,
//     });
//   });
// }

/**
 * Connect to the database
 *
 * Establishes a connection to the database using Prisma Client.
 * This should be called once at application startup.
 *
 * @returns Promise that resolves when the connection is established
 * @throws Error if the connection fails
 */
export async function connectDatabase(): Promise<void> {
  try {
    // Test the connection
    await prisma.$connect();
    logger.info("Database connection established successfully");

    // Verify connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connection verified");
  } catch (error) {
    logger.error("Failed to connect to database", { error });
    throw new Error(
      `Database connection failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Disconnect from the database
 *
 * Closes the database connection gracefully.
 * This should be called during application shutdown.
 *
 * @returns Promise that resolves when the connection is closed
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info("Database connection closed successfully");
  } catch (error) {
    logger.error("Error closing database connection", { error });
    throw error;
  }
}

/**
 * Get the Prisma Client instance
 *
 * @returns The Prisma Client instance
 */
export function getPrismaClient(): PrismaClient {
  return prisma;
}

/**
 * Execute a database transaction
 *
 * @param callback - Function that receives the Prisma client and returns a promise
 * @returns Promise that resolves with the transaction result
 */
export async function transaction<T>(
  callback: (
    tx: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
    >
  ) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback);
}

/**
 * Check if the database is connected
 *
 * @returns Promise that resolves to true if connected, false otherwise
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Export the Prisma client as default
export default prisma;
