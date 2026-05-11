import * as jwt from "jsonwebtoken";
import env from "@/config/env";
import {
  GenerateTokenReturnType,
  VerifyRefreshTokenReturnType,
} from "@/types/utils/jwt.types";

const JWT_SECRET: string = env("JWT_SECRET");
const REFRESH_TOKEN_SECRET: string = env("REFRESH_TOKEN_SECRET", JWT_SECRET); // Fallback to JWT_SECRET if not defined

export type { GenerateTokenReturnType, VerifyRefreshTokenReturnType };

const ACCESS_TOKEN_EXPIRES_IN_MS = 60 * 60 * 1000; // 60 minutes
const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateAccessToken(payload: object): {
  token: string;
  expiresAt: Date;
} {
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRES_IN_MS);
  const token = jwt.sign(payload, JWT_SECRET as jwt.Secret, {
    expiresIn: "60m",
  });
  return { token, expiresAt };
}

export function generateRefreshToken(payload: object): {
  token: string;
  expiresAt: Date;
} {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);
  const token = jwt.sign(payload, REFRESH_TOKEN_SECRET as jwt.Secret, {
    expiresIn: "7d",
  });
  return { token, expiresAt };
}

export function verifyRefreshToken(
  token: string
): VerifyRefreshTokenReturnType | null {
  try {
    return jwt.verify(
      token,
      REFRESH_TOKEN_SECRET as jwt.Secret
    ) as VerifyRefreshTokenReturnType;
  } catch (error) {
    return null;
  }
}

export const generateToken = generateAccessToken;

/**
 * Generate verification token with optional expiration
 * @param payload - Token payload
 * @param expiresIn - Expiration time (string like "1h", "30m", default: no expiration, for backward compatibility)
 * @returns Token string
 */
export function generateVerificationToken(
  payload: object,
  expiresIn?: string
): string {
  if (expiresIn) {
    return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
      expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    });
  }
  return jwt.sign(payload, JWT_SECRET as jwt.Secret);
}

export function verifyVerificationToken(
  token: string
): VerifyRefreshTokenReturnType | null {
  try {
    return jwt.verify(
      token,
      JWT_SECRET as jwt.Secret
    ) as VerifyRefreshTokenReturnType;
  } catch (error) {
    return null;
  }
}
