import bcrypt from "bcrypt";
import { Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { Administrator, RefreshToken } from "@/database/generated/client";
import adminService from "@/services/admin/admin/administrator.service";
import refreshTokenService from "@/services/auth/refreshToken.service";
import {
  GenerateTokenReturnType,
  verifyRefreshToken,
  VerifyRefreshTokenReturnType,
  generateRefreshToken,
} from "@/utils/jwt";
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
        admin.password,
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
        { expiresIn: remember_me ? "1d" : "1h" },
      );

      const {
        token: refreshTokenStr,
        expiresAt: refreshExpiresAt,
      }: GenerateTokenReturnType = generateRefreshToken({ adminId: admin.id });
      await refreshTokenService.createRefreshToken({
        token: refreshTokenStr,
        expiresAt: refreshExpiresAt,
        adminId: admin.id,
      });

      res.cookie("sAAt", accessToken, {
        httpOnly: true,
        secure: env("NODE_ENV", "development") === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        fullName: admin.fullName,
        role: admin.role,
        expiresIn: remember_me ? 86400000 : 3600000,
        refreshToken: refreshTokenStr,
        refreshTokenExpiresIn: refreshExpiresAt.toISOString(),
      });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  /**
   * Rotate admin access cookie using a valid refresh JWT + DB row (same pattern as client refresh).
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken }: { refreshToken: string } = req.body;
      const decoded: VerifyRefreshTokenReturnType | null =
        verifyRefreshToken(refreshToken);
      if (!decoded?.adminId) {
        throw new UnauthorizedError("Invalid or expired refresh token");
      }

      const stored: RefreshToken | null =
        await refreshTokenService.findValidRefreshToken(refreshToken, {
          adminId: decoded.adminId,
        });
      if (!stored) {
        throw new UnauthorizedError("Invalid or expired refresh token");
      }

      const admin: Administrator | null = await adminService.findActiveById(
        decoded.adminId,
      );
      if (!admin) {
        throw new UnauthorizedError("Invalid or expired refresh token");
      }

      const accessToken: string = Jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        },
        env("ADMIN_TOKEN_SECRET"),
        { expiresIn: "1d" },
      );

      res.cookie("sAAt", accessToken, {
        httpOnly: true,
        secure: env("NODE_ENV", "development") === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        fullName: admin.fullName,
        role: admin.role,
        expiresIn: 86400000,
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
      const adminId: string = res.locals.admin!.id;
      await refreshTokenService.revokeAllForOwner({ adminId });
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
