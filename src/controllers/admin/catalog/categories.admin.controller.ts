import { Request, Response } from "express";
import categoryService from "@/services/admin/catalog/category.service";
import { NotFoundError } from "@/utils/customError";
import { errorHandler } from "@/utils/errorHandler";

class CategoriesAdminController {
  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        search,
        page = 1,
        limit = 20,
        includeDeleted = false,
      } = req.query as {
        search?: string;
        page?: number;
        limit?: number;
        includeDeleted?: boolean | string;
      };
      const includeDeletedBool: boolean =
        includeDeleted === true || includeDeleted === "true";
      const [data, total] = await Promise.all([
        categoryService.findMany({
          search,
          page: Number(page),
          limit: Number(limit),
          includeDeleted: includeDeletedBool,
        }),
        categoryService.count({
          search,
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

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name }: { name: string } = req.body;
      await categoryService.assertNameUnique(name.trim());
      const row = await categoryService.create({
        name: name.trim(),
        isActive: true,
      });
      res.status(201).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const { name, isActive }: { name?: string; isActive?: boolean } = req.body;
      const existing = await categoryService.findById(id);
      if (!existing || existing.deletedAt) {
        throw new NotFoundError("Category not found");
      }
      if (name !== undefined && name.trim() !== existing.name) {
        await categoryService.assertNameUnique(name.trim(), id);
      }
      const row = await categoryService.update(id, {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      });
      res.status(200).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const existing = await categoryService.findById(id);
      if (!existing || existing.deletedAt) {
        throw new NotFoundError("Category not found");
      }
      await categoryService.softDelete(id);
      res.status(200).json({ message: "Category deleted" });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };

  restore = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const existing = await categoryService.findById(id);
      if (!existing) {
        throw new NotFoundError("Category not found");
      }
      const row = await categoryService.restore(id);
      res.status(200).json({ data: row });
    } catch (e: unknown) {
      errorHandler(e, res);
    }
  };
}

export default new CategoriesAdminController();
