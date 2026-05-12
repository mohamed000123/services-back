import prisma from "@/database/client";
import type { Prisma, RefreshToken } from "@/database/generated/client";
import { ValidationError } from "@/utils/customError";
import crypto from "crypto";

export interface RefreshTokenOwner {
  clientId?: string;
  adminId?: string;
}

class RefreshTokenService {
  async createRefreshToken(
    params: {
      token: string;
      expiresAt: Date;
    } & RefreshTokenOwner,
  ): Promise<RefreshToken> {
    const {
      token,
      expiresAt,
      clientId,
      adminId,
    }: {
      token: string;
      expiresAt: Date;
      clientId?: string;
      adminId?: string;
    } = params;

    const hasClient: boolean = typeof clientId === "string" && clientId.length > 0;
    const hasAdmin: boolean = typeof adminId === "string" && adminId.length > 0;
    if (hasClient === hasAdmin) {
      throw new ValidationError(
        "Refresh token must be issued for exactly one of client or administrator",
      );
    }

    const tokenHash: string = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const data: Prisma.RefreshTokenCreateInput = {
      tokenHash,
      expiresAt,
      ...(hasClient ? { client: { connect: { id: clientId } } } : {}),
      ...(hasAdmin ? { administrator: { connect: { id: adminId } } } : {}),
    };
    return prisma.refreshToken.create({ data });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const tokenHash: string = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async revokeAllForOwner(owner: RefreshTokenOwner): Promise<void> {
    const where: Prisma.RefreshTokenWhereInput = { revokedAt: null };
    if (owner.clientId) {
      where.clientId = owner.clientId;
    } else if (owner.adminId) {
      where.adminId = owner.adminId;
    } else {
      return;
    }
    await prisma.refreshToken.updateMany({
      where,
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async findValidRefreshToken(
    token: string,
    owner: RefreshTokenOwner,
  ): Promise<RefreshToken | null> {
    const tokenHash: string = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const now: Date = new Date();
    const hasClientOwner: boolean =
      typeof owner.clientId === "string" && owner.clientId.length > 0;
    const hasAdminOwner: boolean =
      typeof owner.adminId === "string" && owner.adminId.length > 0;
    const ownerFilter: Prisma.RefreshTokenWhereInput = hasClientOwner
      ? { clientId: owner.clientId }
      : hasAdminOwner
        ? { adminId: owner.adminId }
        : {};
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
        ...ownerFilter,
      },
    });
  }
}

const refreshTokenService: RefreshTokenService = new RefreshTokenService();
export default refreshTokenService;
