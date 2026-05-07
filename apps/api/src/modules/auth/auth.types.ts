export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;      // userId
  email: string;
  plan: string;
  iat?: number;
  exp?: number;
}

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserPublic {
  id: string;
  email: string;
  plan: string;
  createdAt: Date;
}
