import { Request, Response } from "express";
import { RequestStatus } from "@/database/generated/client";
import serviceRequestDomain from "@/services/shared/serviceRequest.service";
import { errorHandler } from "@/utils/errorHandler";

class RequestsClientController {
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const clientId: string = res.locals.client!.id;
      const { serviceId, notes } = req.body as {
        serviceId: string;
        notes?: string | null;
      };
      const row = await serviceRequestDomain.createForClient(clientId, {
        serviceId,
        notes,
      });
      res.status(201).json({ success: true, data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  listMine = async (req: Request, res: Response): Promise<void> => {
    try {
      const clientId: string = res.locals.client!.id;
      const { status, page = 1, limit = 20 } = req.query as {
        status?: RequestStatus;
        page?: number;
        limit?: number;
      };
      const [data, total] = await Promise.all([
        serviceRequestDomain.listForClient(clientId, {
          status,
          page: Number(page),
          limit: Number(limit),
        }),
        serviceRequestDomain.countForClient(clientId, { status }),
      ]);
      res.status(200).json({
        success: true,
        data,
        meta: { page: Number(page), limit: Number(limit), total },
      });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  getMine = async (req: Request, res: Response): Promise<void> => {
    try {
      const clientId: string = res.locals.client!.id;
      const { id } = req.params as { id: string };
      const row = await serviceRequestDomain.getForClient(clientId, id);
      res.status(200).json({ success: true, data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  cancelMine = async (req: Request, res: Response): Promise<void> => {
    try {
      const clientId: string = res.locals.client!.id;
      const { id } = req.params as { id: string };
      const row = await serviceRequestDomain.cancelByClient(clientId, id);
      res.status(200).json({ success: true, data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };
}

export default new RequestsClientController();
