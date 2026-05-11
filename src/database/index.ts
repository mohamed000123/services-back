/**
 * Database Module
 *
 * This module exports all database-related functionality including:
 * - Prisma Client instance
 * - Connection/disconnection functions
 * - Transaction helpers
 * - Database utilities
 * - Database configuration
 */

export {
  default as prisma,
  getPrismaClient,
  connectDatabase,
  disconnectDatabase,
  transaction,
  isDatabaseConnected,
} from "./client";

export {
  DATABASE_CONFIG,
  getDatabaseUrl,
  isDatabaseLoggingEnabled,
} from "./config";

// Re-export Prisma types for convenience
export type {
  Administrator,
  Prisma,
} from "@/database/generated/client";
