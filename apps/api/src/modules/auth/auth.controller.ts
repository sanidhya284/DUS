import { Request, Response } from 'express';
import * as authService from './auth.service';
import { registerSchema, loginSchema, refreshSchema } from './auth.validator';
import { sendSuccess } from '../../shared/response/apiResponse';

export async function register(req: Request, res: Response): Promise<void> {
  const body = registerSchema.parse(req.body);
  const user = await authService.register(body.email, body.password);
  sendSuccess(res, user, 201);
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body);
  const tokens = await authService.login(body.email, body.password);
  sendSuccess(res, tokens);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const body = refreshSchema.parse(req.body);
  const tokens = await authService.refreshTokens(body.refreshToken);
  sendSuccess(res, tokens);
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // Stateless JWT: client-side token deletion.
  // Add refresh token blocklist here for enhanced security in future.
  sendSuccess(res, { message: 'Logged out successfully' });
}
