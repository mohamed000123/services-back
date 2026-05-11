import "dotenv/config";

/**
 * Environment configuration utility
 *
 * Provides a centralized way to access environment variables using env("KEY") instead of process.env.KEY
 *
 * @example
 * // With default value
 * const port = env("PORT", "8000");
 *
 * // Without default (returns undefined if not set)
 * const dbUrl = env("DATABASE_URL");
 *
 * // Required (throws error if not set)
 * const secret = env.required("ADMIN_COOKIE_SECRET");
 */

/**
 * Get an environment variable by key
 * @param key - The environment variable key
 * @param defaultValue - Optional default value if the key is not set
 * @returns The environment variable value or the default value
 * @throws Error if the environment variable is not set and no default value is provided
 */
export function env(key: string, defaultValue?: string): string {
  const value: string | undefined = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return defaultValue;
  }
  return value;
}

export default env;
