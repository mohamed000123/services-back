import rateLimit from "express-rate-limit";

/**
 * Stricter limit for creating service requests (mobile simulation).
 */
export const requestCreateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many request creations, try again later" },
});

export default requestCreateLimiter;
