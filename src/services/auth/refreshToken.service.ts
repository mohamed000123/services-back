import prisma from "@/database/client";
import type { Prisma, RefreshToken } from "@/database/generated/client";
import crypto from "crypto";

interface RefreshTokenOwner {
  clientId?: string;
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
    }: {
      token: string;
      expiresAt: Date;
      clientId?: string;
    } = params;
    const tokenHash: string = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const data: Prisma.RefreshTokenCreateInput = {
      tokenHash,
      expiresAt,
      ...(clientId ? { client: { connect: { id: clientId } } } : {}),
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
    await prisma.refreshToken.updateMany({
      where: {
        revokedAt: null,
        ...(owner.clientId ? { clientId: owner.clientId } : {}),
      },
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
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: now },
        ...(owner.clientId ? { clientId: owner.clientId } : {}),
      },
    });
  }
}

const refreshTokenService: RefreshTokenService = new RefreshTokenService();
export default refreshTokenService;
