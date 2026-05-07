import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { AuthRepository } from './auth.repository';
import { AuthTokens, JwtPayload, UserPublic } from './auth.types';
import { AppError } from '../../shared/errors/AppError';
import { env } from '../../config/env';

const repo = new AuthRepository();
const BCRYPT_ROUNDS = 12;

let privateKey: string;
let publicKey: string;

function getPrivateKey(): string {
  if (privateKey) return privateKey;

  // Production: inline base64-encoded PEM via JWT_PRIVATE_KEY env var
  if (env.JWT_PRIVATE_KEY) {
    privateKey = Buffer.from(env.JWT_PRIVATE_KEY, 'base64').toString('utf8');
    return privateKey;
  }

  // Development: read from file path
  if (env.JWT_PRIVATE_KEY_PATH) {
    privateKey = fs.readFileSync(path.resolve(env.JWT_PRIVATE_KEY_PATH), 'utf8');
    return privateKey;
  }

  throw new Error('No JWT private key configured');
}

function getPublicKey(): string {
  if (publicKey) return publicKey;

  // Production: inline base64-encoded PEM via JWT_PUBLIC_KEY env var
  if (env.JWT_PUBLIC_KEY) {
    publicKey = Buffer.from(env.JWT_PUBLIC_KEY, 'base64').toString('utf8');
    return publicKey;
  }

  // Development: read from file path
  if (env.JWT_PUBLIC_KEY_PATH) {
    publicKey = fs.readFileSync(path.resolve(env.JWT_PUBLIC_KEY_PATH), 'utf8');
    return publicKey;
  }

  throw new Error('No JWT public key configured');
}

function generateTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>): AuthTokens {
  const accessToken = jwt.sign(payload, getPrivateKey(), {
    algorithm: 'RS256',
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign({ sub: payload.sub }, getPrivateKey(), {
    algorithm: 'RS256',
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
}

export async function register(email: string, password: string): Promise<UserPublic> {
  const exists = await repo.emailExists(email);
  if (exists) throw AppError.conflict('Email already registered', 'EMAIL_EXISTS');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await repo.create(email, passwordHash);

  return { id: String(user._id), email: user.email, plan: user.plan, createdAt: user.createdAt };
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const user = await repo.findByEmail(email);
  if (!user) throw AppError.unauthorized('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw AppError.unauthorized('Invalid credentials');

  return generateTokens({ sub: String(user._id), email: user.email, plan: user.plan });
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  try {
    const payload = jwt.verify(refreshToken, getPublicKey(), { algorithms: ['RS256'] }) as { sub: string };
    const user = await repo.findById(payload.sub);
    if (!user || !user.isActive) throw AppError.unauthorized('User not found or inactive');

    return generateTokens({ sub: String(user._id), email: user.email, plan: user.plan });
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw AppError.unauthorized('Invalid or expired refresh token');
  }
}
