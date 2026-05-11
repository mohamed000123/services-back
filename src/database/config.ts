/**
 * Database Configuration
 *
 * This file contains database-related configuration constants and utilities.
 * All database logic is centralized in this module.
 */

import env from "@/config/env";

/**
 * Database configuration constants
 */
export const DATABASE_CONFIG: {
  MAX_CONNECTIONS: number;
  CONNECTION_TIMEOUT: number;
  QUERY_TIMEOUT: number;
} = {
  /**
   * Maximum number of connections in the connection pool
   */
  MAX_CONNECTIONS: parseInt(env("DATABASE_MAX_CONNECTIONS", "10"), 10),

  /**
   * Connection timeout in milliseconds
   */
  CONNECTION_TIMEOUT: parseInt(env("DATABASE_CONNECTION_TIMEOUT", "10000"), 10),

  /**
   * Query timeout in milliseconds
   */
  QUERY_TIMEOUT: parseInt(env("DATABASE_QUERY_TIMEOUT", "30000"), 10),
} as const;

/**
 * Get database URL from environment variables
 *
 * @returns Database connection URL
 * @throws Error if DATABASE_URL is not set
 */
export function getDatabaseUrl(): string {
  return env("DATABASE_URL");
}

/**
 * Check if database logging is enabled
 *
 * @returns True if database logging is enabled
 */
export function isDatabaseLoggingEnabled(): boolean {
  return env("NODE_ENV", "development") !== "production";
}
