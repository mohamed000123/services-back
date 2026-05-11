import env from "@/config/env";
import { AdministratorRole } from "@/database/generated/client";
import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";

/**
 * @module adminGuard
 * @description
 * Express middleware to protect admin routes by verifying the presence and validity of an admin JWT token in cookies.
 *
 * The middleware expects a signed JWT token in the `sAAt` cookie. It verifies the token using the `ADMIN_COOKIE_SECRET`
 * environment variable. If the token is valid, the decoded admin information (id and email) is attached to `res.locals.admin`
 * for downstream handlers to use. If the token is missing or invalid, the middleware logs the error and passes a 403 error
 * to the next error handler.
 *
 * @param {Request} req - Express request object, expects `sAAt` cookie to be present.
 * @param {Response} res - Express response object, attaches `admin` info to `res.locals` on success.
 * @param {NextFunction} next - Express next middleware function.
 *
 * @returns {Promise<void>} Calls `next()` on success, or passes an error object to `next()` on failure.
 *
 * @example
 * // Usage in an Express route
 * app.get('/admin/dashboard', adminGuard, (req, res) => {
 *   // Access admin info via res.locals.admin
 *   res.send('Welcome, admin!');
 * });
 */
export const adminGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token: string = req.cookies.sAAt;
  if (!token) {
    // logger.error("Unauthorized Admin request");
    return next({ status: 403, message: "Forbidden" });
  }

  try {
    const decoded: {
      id: string;
      email: string;
      role: AdministratorRole;
    } = Jwt.verify(token, env("ADMIN_TOKEN_SECRET")) as {
      id: string;
      email: string;
      role: AdministratorRole;
    };

    if (!decoded) {
      // logger.error("Unauthorized Admin request");
      return next({ status: 403, message: "Forbidden" });
    }

    if (
      decoded.role !== AdministratorRole.SUPER_ADMIN &&
      decoded.role !== AdministratorRole.ADMIN
    ) {
      return next({ status: 403, message: "Forbidden" });
    }

    res.locals.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error: unknown) {
    return next({ status: 403, message: "Forbidden" });
  }
};
