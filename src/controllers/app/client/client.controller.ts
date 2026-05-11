import bcrypt from "bcrypt";
import { Request, Response } from "express";
import clientService from "@/services/app/client/client.service";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "@/utils/customError";
import { errorHandler } from "@/utils/errorHandler";
import { verifyOtp, VerifyOtpResult } from "@/utils/verifyOtp";
import { Client } from "@/database/generated/client";
import prisma from "@/database/client";

class ClientController {
  /**
   * Get logged in client profile
   */
  getMe = async (_req: Request, res: Response): Promise<void> => {
    try {
      const clientId: string = res.locals.client.id;
      const client: Client | null = await clientService.findById(clientId);
      if (!client) {
        return errorHandler(new NotFoundError("Client not found"), res);
      }
      const {
        password: _password,
        ...clientWithoutPassword
      }: { password: string; [key: string]: unknown } = client;

      res.status(200).json({
        success: true,
        message: "Client profile fetched successfully",
        data: clientWithoutPassword,
      });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  // TODO: remove this while you are not using it
  getById = async (req: Request, res: Response): Promise<void> => {
    const { id }: { id: string } = req.params as { id: string };
    try {
      const client: Client | null = await clientService.findById(id);
      if (!client) {
        return errorHandler(new NotFoundError("Client not found"), res);
      }

      res.status(200).json({ data: client });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        oldPassword,
        newPassword,
      }: { oldPassword: string; newPassword: string } = req.body;
      const clientId: string = res.locals.client.id;

      const client: Client | null = await clientService.findById(clientId);
      if (!client) {
        throw new NotFoundError("Client not found");
      }

      const isPasswordValid: boolean = await bcrypt.compare(
        oldPassword,
        client.password,
      );
      if (!isPasswordValid) {
        throw new NotFoundError("Old password is incorrect");
      }

      const isSameAsCurrent: boolean = await bcrypt.compare(
        newPassword,
        client.password,
      );
      if (isSameAsCurrent) {
        throw new ValidationError(
          "New password must be different from your current password",
        );
      }

      const hashedPassword: string = await bcrypt.hash(newPassword, 10);
      // TODO: here must using service not prisma directly
      await prisma.client.update({
        where: { id: clientId },
        data: { password: hashedPassword },
      });

      res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  forgetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        phone,
        otp,
        newPassword,
      }: { phone: string; otp: string; newPassword: string } = req.body;
      // Verify OTP (assuming "login" actionType for forgot password check to ensure user exists)
      const otpResult: VerifyOtpResult = await verifyOtp(
        phone,
        otp,
        false
      );

      if (!otpResult.success) {
        throw new ForbiddenError(otpResult.message);
      }
      const hashedPassword: string = await bcrypt.hash(newPassword, 10);

      // Update password
      // TODO: here must using service not prisma directly
      await prisma.client.update({
        where: { phone: phone },
        data: { password: hashedPassword },
      });

      res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  /**
   * Delete client account (hard delete)
   */
  deleteAccount = async (_req: Request, res: Response): Promise<void> => {
    try {
      const clientId: string = res.locals.client.id;
      await clientService.deleteById(clientId);
      res.status(200).json({
        success: true,
        message: "client Account deleted successfully",
      });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  /**
   * Update Firebase token
   * PUT /app/client/firebase-token
   */
  updateFirebaseToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const clientId: string = res.locals.client.id;
      const { firebaseToken }: { firebaseToken: string } = req.body;

      const updatedClient: Client = await clientService.updateFirebaseToken(
        clientId,
        firebaseToken,
      );

      const {
        password: _password,
        ...clientWithoutPassword
        // TODO: you can use Omit here
      }: { password: string; [key: string]: unknown } = updatedClient;

      res.status(200).json({
        success: true,
        message: "Firebase token updated successfully",
        data: clientWithoutPassword,
      });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  /**
   * Delete Firebase token
   * DELETE /app/client/firebase-token
   */
  deleteFirebaseToken = async (_req: Request, res: Response): Promise<void> => {
    try {
      const clientId: string = res.locals.client.id;

      const updatedClient: Client =
        await clientService.deleteFirebaseToken(clientId);

      const {
        password: _password,
        ...clientWithoutPassword
        // TODO: you can use Omit here
      }: { password: string; [key: string]: unknown } = updatedClient;

      res.status(200).json({
        success: true,
        message: "Firebase token deleted successfully",
        data: clientWithoutPassword,
      });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };
}
const clientController: ClientController = new ClientController();
export default clientController;
