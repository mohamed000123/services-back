import env from "@/config/env";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

const maxRequests: number = parseInt(env("RATE_LIMIT_MAX", "1000"), 10);

/**
 * Rate limiter configuration for Express.
 *
 * This module sets up a rate limiter middleware using `express-rate-limit`.
 * The maximum number of requests allowed per window (default: 1000 per hour)
 * is configurable via the `RATE_LIMIT_MAX` environment variable.
 *
 * Usage:
 *   import limiter from './config/rateLimiter';
 *   app.use(limiter);
 *
 * @see https://www.npmjs.com/package/express-rate-limit
 */
const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: maxRequests,
});

export default limiter;
