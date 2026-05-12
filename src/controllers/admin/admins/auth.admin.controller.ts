import bcrypt from "bcrypt";
import { Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { Administrator } from "@/database/generated/client";
import adminService from "@/services/admin/admin/administrator.service";
import { NotFoundError, UnauthorizedError } from "@/utils/customError";
import { errorHandler } from "@/utils/errorHandler";
import env from "@/config/env";

class AuthAdminController {
  login = async (req: Request, res: Response): Promise<void> => {
    const {
      email,
      password,
      remember_me,
    }: {
      email: string;
      password: string;
      remember_me: boolean;
    } = req.body;

    try {
      const admin: Administrator | null = await adminService.findActiveByEmail(email);

      if (!admin) {
        return errorHandler(new UnauthorizedError("Invalid credentials"), res);
      }

      const isPasswordValid: boolean = await bcrypt.compare(
        password,
        admin.password
      );

      if (!isPasswordValid) {
        return errorHandler(new UnauthorizedError("Invalid credentials"), res);
      }

      const accessToken: string = Jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        },
        env("ADMIN_TOKEN_SECRET"),
        { expiresIn: remember_me ? "1d" : "1h" }
      );

      res.cookie("sAAt", accessToken, {
        httpOnly: true,
        secure: env("NODE_ENV", "development") === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        fullName: admin.fullName,
        role: admin.role,
        expiresIn: remember_me ? 86400000 : 3600000,
      });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  me = async (_req: Request, res: Response): Promise<void> => {
    const id: string = res.locals.admin!.id;
    try {
      const admin: Administrator | null = await adminService.findById(id);

      if (!admin) {
        return errorHandler(new NotFoundError("Admin not found"), res);
      }

      res.status(200).json({ data: admin });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      res.clearCookie("sAAt", {
        httpOnly: true,
        secure: env("NODE_ENV", "development") === "production",
        sameSite: "strict",
      });
      res.status(200).json({ message: "Logout successfully" });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };
}

export default new AuthAdminController();
