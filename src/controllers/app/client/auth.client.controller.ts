import bcrypt from "bcrypt";
import { Request, Response } from "express";
import clientService from "@/services/app/client/client.service";
import { errorHandler } from "@/utils/errorHandler";
import { generateOtpHandler, GenerateOtpResult } from "@/utils/generateOtp";
import { verifyOtp } from "@/utils/verifyOtp";
import {
  DuplicateError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/utils/customError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  VerifyRefreshTokenReturnType,
  GenerateTokenReturnType,
} from "@/utils/jwt";
import { VerifyOtpResult } from "@/utils/verifyOtp";
import { Client, type RefreshToken } from "@/database/generated/client";
import refreshTokenService from "@/services/auth/refreshToken.service";

class AuthClientController {
  loginWithOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, otp }: { phone: string; otp: string } = req.body;
      const otpResult: VerifyOtpResult = await verifyOtp(
        phone,
        otp,
        false
      );
      if (!otpResult.success) {
        throw new ForbiddenError(otpResult.message);
      }

      if (otpResult.actionType !== "login") {
        throw new ValidationError("Invalid login flow");
      }
      const client: Client | null = await clientService.findByPhone(phone);
      if (!client) {
        throw new NotFoundError("Client not found");
      }
      const {
        token: accessToken,
        expiresAt: accessTokenExpiresAt,
      }: GenerateTokenReturnType = generateAccessToken({ clientId: client.id });
      const {
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
      }: GenerateTokenReturnType = generateRefreshToken({
        clientId: client.id,
      });
      await refreshTokenService.createRefreshToken({
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
        clientId: client.id,
      });
      res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken,
        refreshToken,
        accessTokenExpiresIn: accessTokenExpiresAt.toISOString(),
        refreshTokenExpiresIn: refreshTokenExpiresAt.toISOString(),
        // TODO: Remove client object from response and set necessary fields in refresh token payload
        client: {
          id: client.id,
          phone: client.phone,
          fullName: client.fullName,
          email: client.email,
        },
      });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  loginWithEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: { email: string; password: string } = req.body;

      const client: Client | null = await clientService.findByEmail(email);

      if (!client) {
        throw new ForbiddenError("Invalid email or password");
      }

      const isPasswordValid: boolean = await bcrypt.compare(
        password,
        client.password,
      );

      if (!isPasswordValid) {
        throw new ForbiddenError("Invalid email or password");
      }
      // Generate tokens
      const {
        token: accessToken,
        expiresAt: accessTokenExpiresAt,
      }: GenerateTokenReturnType = generateAccessToken({ clientId: client.id });
      const {
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
      }: GenerateTokenReturnType = generateRefreshToken({
        clientId: client.id,
      });
      await refreshTokenService.createRefreshToken({
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
        clientId: client.id,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken,
        refreshToken,
        accessTokenExpiresIn: accessTokenExpiresAt.toISOString(),
        refreshTokenExpiresIn: refreshTokenExpiresAt.toISOString(),
        // TODO: Remove client object from response and set necessary fields in refresh token payload
        client: {
          id: client.id,
          phone: client.phone,
          fullName: client.fullName,
          email: client.email,
        },
      });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        phone,
        otp,
        fullName,
        email,
        password,
      }: {
        phone: string;
        otp: string;
        fullName: string;
        email: string;
        password: string;
      } = req.body;

      // Verify OTP
      const otpResult: VerifyOtpResult = await verifyOtp(
        phone,
        otp,
        true
      );

      if (!otpResult.success) {
        throw new ForbiddenError(otpResult.message);
      }
      if (otpResult.actionType !== "signup") {
        throw new ValidationError("Invalid signup flow");
      }

      // Check email & phone uniqueness
      const existingClient: Client | null = await clientService.exists(
        phone,
        email,
      );
      if (existingClient) {
        let message: string = "Client already exists";
        if (existingClient.phone === phone) {
          message = "Phone number already in use";
        } else if (existingClient.email === email) {
          message = "Email already in use";
        }
        throw new DuplicateError(message);
      }

      // Create client
      const hashedPassword: string = await bcrypt.hash(password, 10);
      const client: Client | null = await clientService.create({
        phone: phone,
        fullName,
        email,
        password: hashedPassword,
      });
      const {
        token: accessToken,
        expiresAt: accessTokenExpiresAt,
      }: GenerateTokenReturnType = generateAccessToken({ clientId: client.id });
      const {
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
      }: GenerateTokenReturnType = generateRefreshToken({
        clientId: client.id,
      });
      await refreshTokenService.createRefreshToken({
        token: refreshToken,
        expiresAt: refreshTokenExpiresAt,
        clientId: client.id,
      });
      res.status(201).json({
        success: true,
        message: "Signup successful",
        accessToken,
        refreshToken,
        accessTokenExpiresIn: accessTokenExpiresAt.toISOString(),
        refreshTokenExpiresIn: refreshTokenExpiresAt.toISOString(),
        // TODO: Remove client object from response and set necessary fields in refresh token payload
        client: {
          id: client.id,
          phone: client.phone,
          fullName: client.fullName,
          email: client.email,
        },
      });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      const clientId: string | undefined = res.locals.client?.id;
      if (!clientId) {
        throw new ValidationError("Client ID is required");
      }
      await refreshTokenService.revokeAllForOwner({ clientId });
      res.status(200).json({ message: "Logout successfully" });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  generateOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, isSignupOtp }: { phone: string; isSignupOtp: boolean } =
        req.body;
      const result: GenerateOtpResult = await generateOtpHandler(
        phone,
        isSignupOtp
      );
      if (!result.success) {
        return errorHandler(new UnauthorizedError(result.message), res);
      } else {
        res.status(200).json({ message: result.message, otp: result.otp }); // TODO: Remove otp from response
      }
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      //to be updated to Get refresh token from authorization header not request body
      const { refreshToken }: { refreshToken: string } = req.body;
      const decoded: VerifyRefreshTokenReturnType | null =
        verifyRefreshToken(refreshToken);
      if (!decoded || !decoded.clientId) {
        throw new UnauthorizedError("Invalid or expired refresh token");
      }

      const storedToken: RefreshToken | null =
        await refreshTokenService.findValidRefreshToken(refreshToken, {
          clientId: decoded.clientId,
        });
      if (!storedToken) {
        throw new UnauthorizedError("Invalid or expired refresh token");
      }

      const client: Client | null = await clientService.findById(
        decoded.clientId,
      );
      if (!client) {
        throw new NotFoundError("Client not found");
      }

      const { token: newAccessToken, expiresAt }: GenerateTokenReturnType =
        generateAccessToken({ clientId: client.id });
      res.status(200).json({
        success: true,
        accessToken: newAccessToken,
        accessTokenExpiresIn: expiresAt.toISOString(),
      });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };
}

export default new AuthClientController();
