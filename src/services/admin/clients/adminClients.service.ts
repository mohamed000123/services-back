import bcrypt from "bcrypt";
import prisma from "@/database/client";
import type { Client } from "@/database/generated/client";
import { DuplicateError, NotFoundError } from "@/utils/customError";

const MAX_LIMIT = 100;

class AdminClientsService {
  async findMany(options?: {
    search?: string;
    searchBy?: "fullName" | "email";
    page?: number;
    limit?: number;
  }): Promise<Omit<Client, "password">[]> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, options?.limit ?? 20));
    const search: string | undefined = options?.search?.trim();
    const searchBy: "fullName" | "email" = options?.searchBy ?? "fullName";

    const rows: Client[] = await prisma.client.findMany({
      where: search
        ? {
            [searchBy]: { contains: search },
          }
        : {},
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return rows.map(({ password: _p, ...rest }) => rest);
  }

  async count(options?: {
    search?: string;
    searchBy?: "fullName" | "email";
  }): Promise<number> {
    const search: string | undefined = options?.search?.trim();
    const searchBy: "fullName" | "email" = options?.searchBy ?? "fullName";
    return prisma.client.count({
      where: search
        ? {
            [searchBy]: { contains: search },
          }
        : {},
    });
  }

  async findById(id: string): Promise<Omit<Client, "password"> | null> {
    const c: Client | null = await prisma.client.findUnique({ where: { id } });
    if (!c) {return null;}
    const { password: _p, ...rest } = c;
    return rest;
  }

  async create(input: {
    phone: string;
    email: string;
    fullName: string;
    password: string;
  }): Promise<Omit<Client, "password">> {
    const dup: Client | null = await prisma.client.findFirst({
      where: { OR: [{ phone: input.phone }, { email: input.email }] },
    });
    if (dup) {
      if (dup.phone === input.phone) {
        throw new DuplicateError("Phone number already in use");
      }
      throw new DuplicateError("Email already in use");
    }
    const password: string = await bcrypt.hash(input.password, 10);
    const created: Client = await prisma.client.create({
      data: {
        phone: input.phone,
        email: input.email,
        fullName: input.fullName,
        password,
      },
    });
    const { password: _p, ...rest } = created;
    return rest;
  }

  async update(
    id: string,
    data: { phone?: string; email?: string; fullName?: string },
  ): Promise<Omit<Client, "password">> {
    const existing: Client | null = await prisma.client.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundError("Client not found");
    }
    if (data.email && data.email !== existing.email) {
      const e = await prisma.client.findUnique({ where: { email: data.email } });
      if (e) {throw new DuplicateError("Email already in use");}
    }
    if (data.phone && data.phone !== existing.phone) {
      const p = await prisma.client.findUnique({ where: { phone: data.phone } });
      if (p) {throw new DuplicateError("Phone number already in use");}
    }
    const updated: Client = await prisma.client.update({
      where: { id },
      data: {
        ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
      },
    });
    const { password: _p, ...rest } = updated;
    return rest;
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const existing: Client | null = await prisma.client.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundError("Client not found");
    }
    const hash: string = await bcrypt.hash(password, 10);
    await prisma.client.update({
      where: { id },
      data: { password: hash },
    });
  }

  async deleteById(id: string): Promise<void> {
    const existing: Client | null = await prisma.client.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundError("Client not found");
    }
    await prisma.client.delete({ where: { id } });
  }
}

export default new AdminClientsService();
