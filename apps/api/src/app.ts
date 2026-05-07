import 'express-async-errors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

import { requestIdMiddleware } from './middleware/requestId.middleware';
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware';
import { rateLimit } from './middleware/rateLimit.middleware';

import urlRoutes from './modules/url/url.routes';
import authRoutes from './modules/auth/auth.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import * as urlController from './modules/url/url.controller';

import { getConnectionState } from './config/database';
import { isRedisAvailable } from './config/redis';
import { env } from './config/env';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: env.NODE_ENV === 'production' ? env.API_BASE_URL : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Body parsing
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Compression
app.use(compression());

// Request ID for tracing
app.use(requestIdMiddleware);

// HTTP logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Trust proxy for correct IP from load balancer
app.set('trust proxy', 1);

// ─── Health endpoints ─────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/ready', (_req: Request, res: Response) => {
  const mongoOk = getConnectionState();
  const redisOk = isRedisAvailable();
  const ready = mongoOk; // Redis is optional (graceful degradation)
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not ready',
    mongo: mongoOk,
    redis: redisOk,
  });
});

// ─── Redirect (critical path — mounted at root) ───────────────────────────────
app.get(
  '/:shortCode([a-zA-Z0-9-]{1,32})',
  rateLimit({ maxTokens: 200 }),
  urlController.redirect
);

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ─── Central error handler ────────────────────────────────────────────────────
app.use(errorHandlerMiddleware);

export default app;
