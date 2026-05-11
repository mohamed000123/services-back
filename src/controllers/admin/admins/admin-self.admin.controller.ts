import bcrypt from "bcrypt";
import { Request, Response } from "express";
import adminService from "@/services/admin/admin/administrator.service";
import { NotFoundError, UnauthorizedError } from "@/utils/customError";
import { errorHandler } from "@/utils/errorHandler";
import { Administrator } from "@/database/generated/client";

class AdminSelfAdminController {
  get = async (_req: Request, res: Response): Promise<void> => {
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

  update = async (req: Request, res: Response): Promise<void> => {
    const id: string = res.locals.admin!.id;

    const {
      current_password,
      password,
    }: { current_password: string; password: string } = req.body;

    try {
      const admin: Administrator | null = await adminService.findById(id);

      if (!admin) {
        return errorHandler(new NotFoundError("Admin not found"), res);
      }

      const isPasswordValid: boolean = await bcrypt.compare(
        current_password,
        admin.password
      );
      if (!isPasswordValid) {
        return errorHandler(new UnauthorizedError("Invalid old password"), res);
      }

      const hashedPassword: string = await bcrypt.hash(password, 10);
      const updatedAdmin: Administrator = await adminService.update(id, {
        password: hashedPassword,
      });

      if (!updatedAdmin) {
        return errorHandler(new NotFoundError("Admin not found"), res);
      }

      res.status(200).json({ message: "Admin updated successfully" });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

}

export default new AdminSelfAdminController();
