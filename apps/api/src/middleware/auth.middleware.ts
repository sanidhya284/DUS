import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../config/env';
import { AppError } from '../shared/errors/AppError';
import { JwtPayload } from '../modules/auth/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

let publicKey: string;

function getPublicKey(): string {
  if (publicKey) return publicKey;

  // Production: inline base64-encoded PEM
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

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or malformed Authorization header');
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, getPublicKey(), { algorithms: ['RS256'] }) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}

/** Middleware that sets req.user if token present but does NOT block anonymous requests */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, getPublicKey(), { algorithms: ['RS256'] }) as JwtPayload;
    req.user = payload;
  } catch {
    // Ignore invalid token on optional routes
  }
  next();
}
