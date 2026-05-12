import { Request, Response } from "express";
import categoryService from "@/services/admin/catalog/category.service";
import serviceCatalogService from "@/services/admin/catalog/serviceCatalog.service";
import { NotFoundError } from "@/utils/customError";
import { errorHandler } from "@/utils/errorHandler";

class DiscoveryClientController {
  listCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, page = 1, limit = 50 } = req.query as {
        search?: string;
        page?: number;
        limit?: number;
      };
      const [data, total] = await Promise.all([
        categoryService.findActiveForDiscovery({
          search,
          page: Number(page),
          limit: Number(limit),
        }),
        categoryService.countActiveForDiscovery(search),
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

  listServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId, search, page = 1, limit = 50 } = req.query as {
        categoryId?: string;
        search?: string;
        page?: number;
        limit?: number;
      };
      const [data, total] = await Promise.all([
        serviceCatalogService.findActiveForDiscovery({
          categoryId,
          search,
          page: Number(page),
          limit: Number(limit),
        }),
        serviceCatalogService.countActiveForDiscovery({ categoryId, search }),
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

  getServiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const row = await serviceCatalogService.findById(id);
      if (!row || row.deletedAt || !row.isActive) {
        throw new NotFoundError("Service not found");
      }
      if (row.category.deletedAt || !row.category.isActive) {
        throw new NotFoundError("Service not found");
      }
      res.status(200).json({ success: true, data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };
}

export default new DiscoveryClientController();
