import { AdministratorRole } from "@/database/generated/client";
import { NextFunction, Request, Response } from "express";

/**
 * Requires an authenticated admin whose JWT includes `role: SUPER_ADMIN`.
 * Use after `adminGuard` on routes that must not be available to `ADMIN`.
 */
export function superAdminGuard(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.locals.admin?.role !== AdministratorRole.SUPER_ADMIN) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  next();
}
