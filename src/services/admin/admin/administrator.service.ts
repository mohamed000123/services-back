import prisma from "@/database/client";
import type { Administrator, Prisma } from "@/database/generated/client";
import { ValidationError } from "@/utils/customError";

/**
 * Administrator Service
 *
 * Provides CRUD operations for Administrator model
 */
class AdministratorService {
  /**
   * Create a new administrator
   */
  async create(data: Prisma.AdministratorCreateInput): Promise<Administrator> {
    return prisma.administrator.create({
      data,
    });
  }

  /**
   * Find administrator by ID
   */
  async findById(id: string): Promise<Administrator | null> {
    return prisma.administrator.findUnique({
      where: { id },
    });
  }

  /**
   * Find active (not soft-deleted) administrator by email — for login.
   */
  async findActiveByEmail(email: string): Promise<Administrator | null> {
    return prisma.administrator.findFirst({
      where: { email, deletedAt: null },
    });
  }

  /**
   * Find administrator by email
   */
  async findByEmail(email: string): Promise<Administrator | null> {
    return prisma.administrator.findUnique({
      where: { email },
    });
  }

  /**
   * Find all administrators with optional filters
   */
  async findMany(options?: {
    search?: string;
    searchBy?: "fullName" | "email";
    page?: number;
    limit?: number;
  }): Promise<Administrator[]> {
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
    } = options || {};

    // Check searchBy validity only if search is present, otherwise allow undefined
    if (
      searchBy &&
      searchBy !== "fullName" &&
      searchBy !== "email"
    ) {
      throw new ValidationError("Invalid search by");
    }
    return prisma.administrator.findMany({
      where: {
        deletedAt: null,
        ...(search &&
          searchBy && {
          [searchBy as keyof Administrator]: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Count administrators with optional filters
   */
  async count(where?: Prisma.AdministratorWhereInput): Promise<number> {
    return prisma.administrator.count({
      where,
    });
  }

  /**
   * Update administrator by ID
   */
  async update(
    id: string,
    data: Prisma.AdministratorUpdateInput
  ): Promise<Administrator> {
    return prisma.administrator.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete administrator (sets deletedAt timestamp)
   */
  async softDelete(id: string): Promise<Administrator> {
    return prisma.administrator.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Restore soft-deleted administrator
   */
  async restore(id: string): Promise<Administrator> {
    return prisma.administrator.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }

  /**
   * Hard delete administrator (permanent removal)
   */
  async delete(id: string): Promise<Administrator> {
    return prisma.administrator.delete({
      where: { id },
    });
  }

  /**
   * Check if administrator exists
   */
  async exists(id: string): Promise<boolean> {
    const count: number = await prisma.administrator.count({
      where: { id, deletedAt: null },
    });
    return count > 0;
  }

}

// Export singleton instance
const administratorService: AdministratorService = new AdministratorService();

export default administratorService;
