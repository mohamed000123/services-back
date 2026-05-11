export interface VerifyRefreshTokenReturnType {
  clientId?: string;
  newEmail?: string;
  iat: number;
  exp: number;
}

export interface GenerateTokenReturnType {
  token: string;
  expiresAt: Date;
}
