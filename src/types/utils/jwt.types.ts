export interface VerifyRefreshTokenReturnType {
  clientId?: string;
  adminId?: string;
  newEmail?: string;
  iat: number;
  exp: number;
}

export interface GenerateTokenReturnType {
  token: string;
  expiresAt: Date;
}
