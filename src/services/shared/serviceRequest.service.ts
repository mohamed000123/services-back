import prisma from "@/database/client";
import type { Prisma, ServiceRequest } from "@/database/generated/client";
import { RequestStatus } from "@/database/generated/client";
import {
  CustomError,
  ForbiddenError,
  NotFoundError,
  UnprocessableError,
  ValidationError,
} from "@/utils/customError";
import {
  emitRequestCreated,
  emitRequestStatusChanged,
  emitRequestUpdated,
} from "@/services/shared/realtime.emitter";
const MAX_LIMIT = 100;

const ALLOWED: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.PENDING]: [
    RequestStatus.IN_PROGRESS,
    RequestStatus.CANCELLED,
  ],
  [RequestStatus.IN_PROGRESS]: [
    RequestStatus.COMPLETED,
    RequestStatus.CANCELLED,
  ],
  [RequestStatus.COMPLETED]: [],
  [RequestStatus.CANCELLED]: [],
};

function assertTransition(from: RequestStatus, to: RequestStatus): void {
  const next: RequestStatus[] = ALLOWED[from] ?? [];
  if (!next.includes(to)) {
    throw new UnprocessableError(
      [
        new CustomError(
          `Invalid transition from ${from} to ${to}`,
          422,
        ),
      ],
      "Invalid status transition",
    );
  }
}

export type RequestListRow = ServiceRequest & {
  client: { id: string; fullName: string; email: string; phone: string };
  service: { id: string; name: string; category: { id: string; name: string } };
};

function toRealtimePayload(row: {
  id: string;
  clientId: string;
  serviceId: string;
  status: RequestStatus;
  notes: string | null;
  priceAtRequest: { toFixed: (n: number) => string };
  assignedAdminId: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  client: { fullName: string; email: string };
  service: { name: string; category: { name: string } };
}): Record<string, unknown> {
  const base = {
    id: row.id,
    clientId: row.clientId,
    serviceId: row.serviceId,
    status: row.status,
    notes: row.notes ?? null,
    priceAtRequest: row.priceAtRequest.toFixed(2),
    assignedAdminId: row.assignedAdminId ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
    clientName: row.client.fullName,
    clientEmail: row.client.email,
    serviceName: row.service.name,
    categoryName: row.service.category.name,
  };
  return base;
}

async function buildDetail(id: string): Promise<
  ServiceRequest & {
    client: { id: string; fullName: string; email: string; phone: string };
    service: { id: string; name: string; category: { id: string; name: string } };
    history: {
      id: string;
      fromStatus: RequestStatus | null;
      toStatus: RequestStatus;
      changedById: string | null;
      createdAt: Date;
    }[];
  }
> {
  const row = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, fullName: true, email: true, phone: true } },
      service: {
        select: {
          id: true,
          name: true,
          category: { select: { id: true, name: true } },
        },
      },
      history: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          changedById: true,
          createdAt: true,
        },
      },
    },
  });
  if (!row) {
    throw new NotFoundError("Request not found");
  }
  return row;
}

class ServiceRequestDomainService {
  async createForClient(
    clientId: string,
    input: { serviceId: string; notes?: string | null },
  ): Promise<RequestListRow> {
    const service = await prisma.service.findFirst({
      where: {
        id: input.serviceId,
        deletedAt: null,
        isActive: true,
        category: { deletedAt: null, isActive: true },
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
    if (!service) {
      throw new ValidationError("Service is not available");
    }

    const created = await prisma.$transaction(async (tx) => {
      const req = await tx.serviceRequest.create({
        data: {
          clientId,
          serviceId: service.id,
          status: RequestStatus.PENDING,
          notes: input.notes ?? null,
          priceAtRequest: service.price,
        },
        include: {
          client: { select: { id: true, fullName: true, email: true, phone: true } },
          service: {
            select: {
              id: true,
              name: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      });
      await tx.requestStatusHistory.create({
        data: {
          requestId: req.id,
          fromStatus: null,
          toStatus: RequestStatus.PENDING,
          changedById: null,
        },
      });
      return req;
    });

    emitRequestCreated(toRealtimePayload(created));
    return created;
  }

  async cancelByClient(clientId: string, requestId: string): Promise<RequestListRow> {
    const existing = await prisma.serviceRequest.findFirst({
      where: { id: requestId, clientId },
      include: {
        client: { select: { id: true, fullName: true, email: true, phone: true } },
        service: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!existing) {
      throw new NotFoundError("Request not found");
    }
    if (existing.status !== RequestStatus.PENDING) {
      throw new ForbiddenError("Only pending requests can be cancelled");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.serviceRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.CANCELLED,
          cancelledAt: new Date(),
        },
        include: {
          client: { select: { id: true, fullName: true, email: true, phone: true } },
          service: {
            select: {
              id: true,
              name: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      });
      await tx.requestStatusHistory.create({
        data: {
          requestId: row.id,
          fromStatus: RequestStatus.PENDING,
          toStatus: RequestStatus.CANCELLED,
          changedById: null,
        },
      });
      return row;
    });

    emitRequestStatusChanged(toRealtimePayload(updated));
    return updated;
  }

  async updateStatusByAdmin(
    adminId: string,
    requestId: string,
    input: { status: RequestStatus; note?: string | null },
  ): Promise<RequestListRow> {
    const existing = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        client: { select: { id: true, fullName: true, email: true, phone: true } },
        service: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!existing) {
      throw new NotFoundError("Request not found");
    }
    assertTransition(existing.status, input.status);

    const data: Prisma.ServiceRequestUpdateInput = {
      status: input.status,
    };
    if (input.status === RequestStatus.COMPLETED) {
      data.completedAt = new Date();
    }
    if (input.status === RequestStatus.CANCELLED) {
      data.cancelledAt = new Date();
    }
    if (input.note?.trim()) {
      const prev = existing.notes ?? "";
      data.notes = prev ? `${prev}\n[admin]: ${input.note.trim()}` : `[admin]: ${input.note.trim()}`;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.serviceRequest.update({
        where: { id: requestId },
        data,
        include: {
          client: { select: { id: true, fullName: true, email: true, phone: true } },
          service: {
            select: {
              id: true,
              name: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      });
      await tx.requestStatusHistory.create({
        data: {
          requestId: row.id,
          fromStatus: existing.status,
          toStatus: input.status,
          changedById: adminId,
        },
      });
      return row;
    });

    emitRequestStatusChanged(toRealtimePayload(updated));
    return updated;
  }

  async assignAdmin(
    requestId: string,
    adminId: string | null,
  ): Promise<RequestListRow> {
    const existing = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        client: { select: { id: true, fullName: true, email: true, phone: true } },
        service: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!existing) {
      throw new NotFoundError("Request not found");
    }
    if (adminId) {
      const admin = await prisma.administrator.findFirst({
        where: { id: adminId, deletedAt: null },
      });
      if (!admin) {
        throw new ValidationError("Administrator not found");
      }
    }
    const updated = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { assignedAdminId: adminId },
      include: {
        client: { select: { id: true, fullName: true, email: true, phone: true } },
        service: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });
    emitRequestUpdated(toRealtimePayload(updated));
    return updated;
  }

  async countForClient(
    clientId: string,
    options?: { status?: RequestStatus },
  ): Promise<number> {
    return prisma.serviceRequest.count({
      where: {
        clientId,
        ...(options?.status ? { status: options.status } : {}),
      },
    });
  }

  async listForClient(
    clientId: string,
    options?: { status?: RequestStatus; page?: number; limit?: number },
  ): Promise<RequestListRow[]> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, options?.limit ?? 20));
    return prisma.serviceRequest.findMany({
      where: {
        clientId,
        ...(options?.status ? { status: options.status } : {}),
      },
      include: {
        client: { select: { id: true, fullName: true, email: true, phone: true } },
        service: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getForClient(clientId: string, requestId: string): Promise<Awaited<ReturnType<typeof buildDetail>>> {
    const row = await buildDetail(requestId);
    if (row.clientId !== clientId) {
      throw new ForbiddenError("Forbidden");
    }
    return row;
  }

  async listForAdmin(options?: {
    status?: RequestStatus;
    clientId?: string;
    serviceId?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
    sort?: "asc" | "desc";
  }): Promise<RequestListRow[]> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, options?.limit ?? 20));
    const sortDir = options?.sort === "asc" ? "asc" : "desc";
    return prisma.serviceRequest.findMany({
      where: {
        ...(options?.status ? { status: options.status } : {}),
        ...(options?.clientId ? { clientId: options.clientId } : {}),
        ...(options?.serviceId ? { serviceId: options.serviceId } : {}),
        ...(options?.from || options?.to
          ? {
              createdAt: {
                ...(options.from ? { gte: options.from } : {}),
                ...(options.to ? { lte: options.to } : {}),
              },
            }
          : {}),
      },
      include: {
        client: { select: { id: true, fullName: true, email: true, phone: true } },
        service: {
          select: {
            id: true,
            name: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: sortDir },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async countForAdmin(options?: {
    status?: RequestStatus;
    clientId?: string;
    serviceId?: string;
    from?: Date;
    to?: Date;
  }): Promise<number> {
    return prisma.serviceRequest.count({
      where: {
        ...(options?.status ? { status: options.status } : {}),
        ...(options?.clientId ? { clientId: options.clientId } : {}),
        ...(options?.serviceId ? { serviceId: options.serviceId } : {}),
        ...(options?.from || options?.to
          ? {
              createdAt: {
                ...(options.from ? { gte: options.from } : {}),
                ...(options.to ? { lte: options.to } : {}),
              },
            }
          : {}),
      },
    });
  }

  async getDetailForAdmin(id: string): Promise<Awaited<ReturnType<typeof buildDetail>>> {
    return buildDetail(id);
  }

  async statsByStatus(): Promise<Record<string, number>> {
    const rows = await prisma.serviceRequest.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    const out: Record<string, number> = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const r of rows) {
      out[r.status] = r._count.id;
    }
    return out;
  }
}

export default new ServiceRequestDomainService();
