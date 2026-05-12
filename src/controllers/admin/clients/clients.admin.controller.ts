import { Request, Response } from "express";
import adminClientsService from "@/services/admin/clients/adminClients.service";
import { errorHandler } from "@/utils/errorHandler";

class ClientsAdminController {
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        search,
        searchBy = "fullName",
        page = 1,
        limit = 20,
      } = req.query as {
        search?: string;
        searchBy?: "fullName" | "email";
        page?: number;
        limit?: number;
      };
      const [data, total] = await Promise.all([
        adminClientsService.findMany({
          search,
          searchBy,
          page: Number(page),
          limit: Number(limit),
        }),
        adminClientsService.count({ search, searchBy }),
      ]);
      res.status(200).json({
        data,
        meta: { page: Number(page), limit: Number(limit), total },
      });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const row = await adminClientsService.findById(id);
      if (!row) {
        res.status(404).json({ message: "Client not found" });
        return;
      }
      res.status(200).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, email, fullName, password } = req.body as {
        phone: string;
        email: string;
        fullName: string;
        password: string;
      };
      const row = await adminClientsService.create({
        phone,
        email,
        fullName,
        password,
      });
      res.status(201).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const body = req.body as {
        phone?: string;
        email?: string;
        fullName?: string;
      };
      const row = await adminClientsService.update(id, body);
      res.status(200).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  patchPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { password } = req.body as { password: string };
      await adminClientsService.updatePassword(id, password);
      res.status(200).json({ message: "Password updated" });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await adminClientsService.deleteById(id);
      res.status(200).json({ message: "Client deleted" });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };
}

export default new ClientsAdminController();
