import prisma from "@/database/client";
import type { Category, Prisma } from "@/database/generated/client";
import { ValidationError } from "@/utils/customError";

const MAX_LIMIT = 100;

class CategoryService {
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async findMany(options?: {
    search?: string;
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
  }): Promise<Category[]> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, options?.limit ?? 20));
    const search: string | undefined = options?.search?.trim();
    const includeDeleted: boolean = options?.includeDeleted ?? false;

    return prisma.category.findMany({
      where: {
        ...(includeDeleted ? {} : { deletedAt: null }),
        ...(search ? { name: { contains: search } } : {}),
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async count(options?: {
    search?: string;
    includeDeleted?: boolean;
  }): Promise<number> {
    const search: string | undefined = options?.search?.trim();
    const includeDeleted: boolean = options?.includeDeleted ?? false;
    return prisma.category.count({
      where: {
        ...(includeDeleted ? {} : { deletedAt: null }),
        ...(search ? { name: { contains: search } } : {}),
      },
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  async softDelete(id: string): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async restore(id: string): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }

  /**
   * Active categories for mobile discovery (not deleted, active flag on).
   */
  async findActiveForDiscovery(options?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Category[]> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, options?.limit ?? 50));
    const search: string | undefined = options?.search?.trim();
    return prisma.category.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        ...(search ? { name: { contains: search } } : {}),
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countActiveForDiscovery(search?: string): Promise<number> {
    return prisma.category.count({
      where: {
        deletedAt: null,
        isActive: true,
        ...(search?.trim() ? { name: { contains: search.trim() } } : {}),
      },
    });
  }

  async assertNameUnique(name: string, excludeId?: string): Promise<void> {
    const found: Category | null = await prisma.category.findFirst({
      where: {
        name,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (found) {
      throw new ValidationError("Category name already exists");
    }
  }
}

export default new CategoryService();
