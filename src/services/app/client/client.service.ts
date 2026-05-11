import prisma from "@/database/client";
import type { Client, Prisma } from "@/database/generated/client";
// Client Service  Provides CRUD operations for Client model

class ClientService {
  async create(data: Prisma.ClientCreateInput): Promise<Client> {
    return prisma.client.create({
      data,
    });
  }

  async findById(id: string): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { phone: phone },
    });
  }

  /**
   * Find all clients with optional filters
   */
  async findMany(options?: {
    search?: string;
    searchBy?: "name" | "email";
    page?: number;
    limit?: number;
  }): Promise<Client[]> {
    const {
      search,
      searchBy,
      page = 1,
      limit = 10,
    }: {
      search?: string;
      searchBy?: "name" | "email";
      page?: number;
      limit?: number;
    } = options || {};

    return prisma.client.findMany({
      where: {
        ...(search &&
          searchBy && {
          [searchBy as keyof Client]: {
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

  async update(id: string, data: Prisma.ClientUpdateInput): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data,
    });
  }

  /**
   * Check if Client exists
   */
  async exists(phone: string, email: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: {
        OR: [{ phone: phone }, { email }],
      },
    });
  }
  async deleteById(clientId: string): Promise<void> {
    await prisma.client.delete({
      where: { id: clientId },
    });
  }

  /**
   * Update Firebase token for client
   * @param clientId - Client ID
   * @param firebaseToken - Firebase token
   * @returns Updated client
   */
  async updateFirebaseToken(
    clientId: string,
    firebaseToken: string,
  ): Promise<Client> {
    return prisma.client.update({
      where: { id: clientId },
      data: { firebaseToken },
    });
  }

  /**
   * Delete Firebase token for client (set to empty string)
   * @param clientId - Client ID
   * @returns Updated client
   */
  async deleteFirebaseToken(clientId: string): Promise<Client> {
    return prisma.client.update({
      where: { id: clientId },
      data: { firebaseToken: "" },
    });
  }
}

// Export singleton instance
const clientService: ClientService = new ClientService();

export default clientService;
