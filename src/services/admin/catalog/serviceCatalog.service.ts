import prisma from "@/database/client";
import type { Prisma, Service } from "@/database/generated/client";
import { ValidationError } from "@/utils/customError";

const MAX_LIMIT = 100;

/**
 * Admin list:
 * - With `includeDeleted: false` (default “active” list): exclude services whose category
 *   is archived (soft-deleted), not only soft-deleted services.
 * - With `includeDeleted: true`: keep hiding doubly-soft-deleted pairs (service + category)
 *   via the trailing `OR` clause.
 */
function adminListWhereClause(options?: {
  categoryId?: string;
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}): Prisma.ServiceWhereInput {
  const includeDeleted: boolean = options?.includeDeleted ?? false;
  const search: string | undefined = options?.search?.trim();

  const and: Prisma.ServiceWhereInput[] = [];

  if (!includeDeleted) {
    and.push({ deletedAt: null });
    and.push({ category: { deletedAt: null } });
  }
  if (options?.categoryId) {
    and.push({ categoryId: options.categoryId });
  }
  if (typeof options?.isActive === "boolean") {
    and.push({ isActive: options.isActive });
  }
  if (search) {
    and.push({
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    });
  }
  and.push({
    OR: [
      { deletedAt: null },
      { category: { deletedAt: null } },
    ],
  });

  return and.length === 1 ? and[0]! : { AND: and };
}

class ServiceCatalogService {
  async create(data: Prisma.ServiceCreateInput): Promise<Service> {
    return prisma.service.create({ data });
  }

  async findById(id: string) {
    return prisma.service.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async findMany(options?: {
    categoryId?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
  }): Promise<Service[]> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, options?.limit ?? 20));

    return prisma.service.findMany({
      where: adminListWhereClause(options),
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async count(options?: {
    categoryId?: string;
    search?: string;
    isActive?: boolean;
    includeDeleted?: boolean;
  }): Promise<number> {
    return prisma.service.count({
      where: adminListWhereClause(options),
    });
  }

  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async softDelete(id: string): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async restore(id: string): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }

  /**
   * Active services whose category is active and not deleted.
   */
  async findActiveForDiscovery(options?: {
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Service[]> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, options?.limit ?? 50));
    const search: string | undefined = options?.search?.trim();
    return prisma.service.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        category: { deletedAt: null, isActive: true },
        ...(options?.categoryId ? { categoryId: options.categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countActiveForDiscovery(options?: {
    categoryId?: string;
    search?: string;
  }): Promise<number> {
    const search: string | undefined = options?.search?.trim();
    return prisma.service.count({
      where: {
        deletedAt: null,
        isActive: true,
        category: { deletedAt: null, isActive: true },
        ...(options?.categoryId ? { categoryId: options.categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : {}),
      },
    });
  }

  async assertCategoryUsable(categoryId: string): Promise<void> {
    const cat = await prisma.category.findFirst({
      where: { id: categoryId, deletedAt: null },
    });
    if (!cat) {
      throw new ValidationError("Category not found");
    }
  }
}

export default new ServiceCatalogService();
