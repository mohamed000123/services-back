import { Request, Response } from "express";
import { Prisma } from "@/database/generated/client";
import serviceCatalogService from "@/services/admin/catalog/serviceCatalog.service";
import { NotFoundError } from "@/utils/customError";
import { errorHandler } from "@/utils/errorHandler";

class ServicesAdminController {
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        categoryId,
        search,
        isActive,
        page = 1,
        limit = 20,
        includeDeleted = false,
      } = req.query as {
        categoryId?: string;
        search?: string;
        isActive?: boolean | string;
        page?: number;
        limit?: number;
        includeDeleted?: boolean | string;
      };
      const includeDeletedBool: boolean =
        includeDeleted === true || includeDeleted === "true";
      const [data, total] = await Promise.all([
        serviceCatalogService.findMany({
          categoryId,
          search,
          isActive:
            typeof isActive === "string"
              ? isActive === "true"
              : typeof isActive === "boolean"
                ? isActive
                : undefined,
          page: Number(page),
          limit: Number(limit),
          includeDeleted: includeDeletedBool,
        }),
        serviceCatalogService.count({
          categoryId,
          search,
          isActive:
            typeof isActive === "string"
              ? isActive === "true"
              : typeof isActive === "boolean"
                ? isActive
                : undefined,
          includeDeleted: includeDeletedBool,
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
      const row = await serviceCatalogService.findById(id);
      if (!row) {
        throw new NotFoundError("Service not found");
      }
      res.status(200).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        description,
        price,
        categoryId,
        isActive,
      }: {
        name: string;
        description?: string | null;
        price: number;
        categoryId: string;
        isActive?: boolean;
      } = req.body;
      await serviceCatalogService.assertCategoryUsable(categoryId);
      const row = await serviceCatalogService.create({
        name: name.trim(),
        description: description ?? null,
        price: new Prisma.Decimal(price),
        category: { connect: { id: categoryId } },
        isActive: typeof isActive === "boolean" ? isActive : true,
      });
      res.status(201).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const {
        name,
        description,
        price,
        categoryId,
        isActive,
      }: {
        name?: string;
        description?: string | null;
        price?: number;
        categoryId?: string;
        isActive?: boolean;
      } = req.body;
      const existing = await serviceCatalogService.findById(id);
      if (!existing || existing.deletedAt) {
        throw new NotFoundError("Service not found");
      }
      if (categoryId) {
        await serviceCatalogService.assertCategoryUsable(categoryId);
      }
      const data: Prisma.ServiceUpdateInput = {};
      if (name !== undefined) {data.name = name.trim();}
      if (description !== undefined) {data.description = description;}
      if (price !== undefined) {data.price = new Prisma.Decimal(price);}
      if (categoryId !== undefined) {data.category = { connect: { id: categoryId } };}
      if (typeof isActive === "boolean") {data.isActive = isActive;}
      const row = await serviceCatalogService.update(id, data);
      res.status(200).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const existing = await serviceCatalogService.findById(id);
      if (!existing || existing.deletedAt) {
        throw new NotFoundError("Service not found");
      }
      await serviceCatalogService.softDelete(id);
      res.status(200).json({ message: "Service deleted" });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  restore = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const existing = await serviceCatalogService.findById(id);
      if (!existing) {
        throw new NotFoundError("Service not found");
      }
      const row = await serviceCatalogService.restore(id);
      res.status(200).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };
}

export default new ServicesAdminController();
