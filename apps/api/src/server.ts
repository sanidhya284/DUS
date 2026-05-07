import 'dotenv/config';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initQueue } from './config/queue';
import { initGeoIp } from './shared/utils/geoip';
import app from './app';

const SHUTDOWN_TIMEOUT_MS = 10000;

async function bootstrap(): Promise<void> {
  console.log(`🚀 Starting DUS API [${env.NODE_ENV}]`);

  // Connect infrastructure — Redis failure is non-fatal
  await connectDatabase();
  await connectRedis();
  initQueue();
  await initGeoIp();

  const server = app.listen(env.PORT, () => {
    console.log(`✅ API listening on port ${env.PORT}`);
  });

  // ─── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully`);

    const forceExit = setTimeout(() => {
      console.error('⚠️  Forced exit after timeout');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    server.close(async () => {
      clearTimeout(forceExit);
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Bootstrap failed:', err);
  process.exit(1);
});
