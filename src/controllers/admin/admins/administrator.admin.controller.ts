import bcrypt from "bcrypt";
import { Request, Response } from "express";
import adminService from "@/services/admin/admin/administrator.service";
import { DuplicateError, NotFoundError } from "@/utils/customError";
import { errorHandler } from "@/utils/errorHandler";
import {
  Administrator,
  AdministratorRole,
  type Prisma,
} from "@/database/generated/client";

class AdministratorAdminController {
  get = async (req: Request, res: Response): Promise<void> => {
    const {
      search,
      searchBy,
      page = 1,
      limit = 10,
    }: {
      search?: string;
      searchBy?: "fullName" | "email";
      page?: number;
      limit?: number;
    } = req.query;

    try {
      const admins: Administrator[] = await adminService.findMany({
        search,
        searchBy,
        page: Number(page),
        limit: Number(limit),
      });

      res.status(200).json({ data: admins });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id }: { id: string } = req.params as { id: string };
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

  create = async (req: Request, res: Response): Promise<void> => {
    const { data }: { data: Partial<Administrator> } = req.body;

    try {
      const duplicationCheck: Administrator | null =
        await adminService.findByEmail(data.email!);

      if (duplicationCheck && duplicationCheck.email === data.email) {
        return errorHandler(
          new DuplicateError("Admin Email already exists"),
          res
        );
      }

      data.password = await bcrypt.hash(data.password!, 10);

      const newAdmin: Administrator = await adminService.create({
        fullName: data.fullName!,
        email: data.email!,
        password: data.password!,
        role: AdministratorRole.ADMIN,
      });

      if (!newAdmin) {
        return errorHandler(new NotFoundError("Admin not found"), res);
      }

      res.status(201).json({ message: "Admin created successfully" });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id }: { id: string } = req.params as { id: string };
    const { data }: { data: Partial<Administrator> } = req.body;

    try {
      const admin: Administrator | null = await adminService.findById(id);

      if (!admin) {
        return errorHandler(new NotFoundError("Admin not found"), res);
      }

      if (admin.email !== data.email) {
        const duplicationCheck: Administrator | null =
          await adminService.findByEmail(data.email!);

        if (duplicationCheck && duplicationCheck.email === data.email) {
          return errorHandler(
            new DuplicateError("Admin with this email already exists"),
            res
          );
        }
      }

      const updateData: Prisma.AdministratorUpdateInput = {
        fullName: data.fullName!,
        email: data.email!,
      };
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }
      if (data.role !== undefined) {
        updateData.role = data.role;
      }

      const updatedAdmin: Administrator = await adminService.update(
        id,
        updateData
      );

      if (!updatedAdmin) {
        return errorHandler(new NotFoundError("Admin not found"), res);
      }

      res.status(200).json({ message: "Admin updated successfully" });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  updatePassword = async (req: Request, res: Response): Promise<void> => {
    const { id }: { id: string } = req.params as { id: string };
    const { password }: { password: string } = req.body;

    try {
      const admin: Administrator | null = await adminService.findById(id);

      if (!admin) {
        return errorHandler(new NotFoundError("Admin not found"), res);
      }

      const updatedAdmin: Administrator = await adminService.update(id, {
        password: await bcrypt.hash(password, 10),
      });

      if (!updatedAdmin) {
        return errorHandler(new NotFoundError("Admin not found"), res);
      }

      res.status(200).json({ message: "Admin password updated successfully" });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  restore = async (req: Request, res: Response): Promise<void> => {
    const { id }: { id: string } = req.params as { id: string };
    try {
      const restoredAdmin: Administrator = await adminService.restore(id);

      if (!restoredAdmin) {
        return errorHandler(new NotFoundError("Admin not found"), res);
      }

      res.status(200).json({ message: "Admin restored successfully" });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { id }: { id: string } = req.params as { id: string };
    try {
      const deletedAdmin: Administrator = await adminService.softDelete(id);

      if (!deletedAdmin) {
        return errorHandler(new NotFoundError("Admin not found"), res);
      }

      res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error: unknown) {
      errorHandler(error, res);
    }
  };
}

export default new AdministratorAdminController();
