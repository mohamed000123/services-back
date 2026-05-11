import { NextFunction, Request, Response } from "express";

/**
 * Language Middleware
 * Extracts language from Accept-Language header
 * Adds req.lang to the request object
 * Default: 'en' if no language is specified
 */
export const languageMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Check Accept-Language header
  const acceptLanguage: string | undefined = req.headers["accept-language"];
  if (acceptLanguage) {
    // Check if Arabic is preferred
    if (acceptLanguage.toLowerCase().includes("ar")) {
      req.lang = "ar";
      return next();
    }
    // Check if English is preferred
    if (acceptLanguage.toLowerCase().includes("en")) {
      req.lang = "en";
      return next();
    }
  }

  // Default to English
  req.lang = "en";
  next();
};

// Extend Express Request type to include lang property
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      lang?: "en" | "ar";
    }
  }
}
