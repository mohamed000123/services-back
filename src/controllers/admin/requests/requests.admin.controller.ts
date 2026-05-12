import { Request, Response } from "express";
import { RequestStatus } from "@/database/generated/client";
import serviceRequestDomain from "@/services/shared/serviceRequest.service";
import { errorHandler } from "@/utils/errorHandler";

class RequestsAdminController {
  stats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await serviceRequestDomain.statsByStatus();
      res.status(200).json({ data });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        status,
        clientId,
        serviceId,
        from,
        to,
        page = 1,
        limit = 20,
        sort = "desc",
      } = req.query as {
        status?: RequestStatus;
        clientId?: string;
        serviceId?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
        sort?: "asc" | "desc";
      };
      const fromDate = from ? new Date(from) : undefined;
      const toDate = to ? new Date(to) : undefined;
      const [data, total] = await Promise.all([
        serviceRequestDomain.listForAdmin({
          status,
          clientId,
          serviceId,
          from: fromDate,
          to: toDate,
          page: Number(page),
          limit: Number(limit),
          sort,
        }),
        serviceRequestDomain.countForAdmin({
          status,
          clientId,
          serviceId,
          from: fromDate,
          to: toDate,
        }),
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
      const row = await serviceRequestDomain.getDetailForAdmin(id);
      res.status(200).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  patchStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId: string = res.locals.admin!.id;
      const { id } = req.params as { id: string };
      const { status, note } = req.body as {
        status: RequestStatus;
        note?: string | null;
      };
      const row = await serviceRequestDomain.updateStatusByAdmin(adminId, id, {
        status,
        note,
      });
      res.status(200).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  patchAssign = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { adminId } = req.body as { adminId: string | null };
      const row = await serviceRequestDomain.assignAdmin(id, adminId ?? null);
      res.status(200).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };
}

export default new RequestsAdminController();
