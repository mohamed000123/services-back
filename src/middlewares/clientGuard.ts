import env from "@/config/env";
import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
/**
 * @module clientGuard
 * @description
 * Express middleware to protect client routes by verifying the presence and validity of a client JWT token in cookies.
 *
 * This middleware expects a signed JWT token in the `cAt` cookie. It verifies the token using the `STORE_COOKIE_SECRET`
 * environment variable. If the token is valid, the decoded client information (id and email) is attached to `res.locals.client`
 * for downstream handlers to use. If the token is missing or invalid, the middleware responds with a 406 Not Acceptable status
 * and a message indicating an unauthorized request.
 *
 * @param {Request} req - Express request object, expects `cAt` cookie to be present.
 * @param {Response} res - Express response object, attaches `client` info to `res.locals` on success.
 * @param {NextFunction} next - Express next middleware function.
 *
 * @returns {Promise<void>} Calls `next()` on success, or sends a 406 response on failure.
 *
 * @example
 * // Usage in an Express route
 * app.get('/client/profile', clientGuard, (req, res) => {
 *   // Access client info via res.locals.client
 *   res.send('Welcome, client!');
 * });
 */
export const clientGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined = req.cookies.cAt;
  if (!token) {
    const authHeader: string | undefined = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    res.status(403).json({ message: "Unauthorized request" });
    return;
  }

  try {
    const secret: string | undefined = env("JWT_SECRET");
    const decoded: JwtPayload = Jwt.verify(
      token,
      secret as string
    ) as JwtPayload;

    if (!decoded) {
      res.status(403).json({ message: "Unauthorized request" });
      return;
    }
    if (decoded.clientId) {
      res.locals.client = { id: decoded.clientId };
    } else {
      throw new Error("Invalid token payload");
    }
    next();
  } catch (error: unknown) {
    res.status(403).json({ message: "Unauthorized request" });
    return;
  }
};
