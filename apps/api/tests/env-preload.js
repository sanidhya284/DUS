/**
 * Jest setupFiles preload — runs before any module is imported in test files.
 * Written as .js to avoid ts-jest type-checking on Node built-in imports.
 */

const { generateKeyPairSync } = require('crypto');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');

const keysDir = path.join(__dirname, 'test-keys');
const privatePath = path.join(keysDir, 'private.pem');
const publicPath = path.join(keysDir, 'public.pem');

if (!existsSync(privatePath)) {
  mkdirSync(keysDir, { recursive: true });
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  writeFileSync(privatePath, privateKey);
  writeFileSync(publicPath, publicKey);
}

process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.API_BASE_URL = 'http://localhost:3001';
process.env.SHORT_CODE_BASE_URL = 'http://localhost:3001';
process.env.MONGO_URI = 'mongodb://localhost:27017/dus_test_placeholder';
process.env.MONGO_DB_NAME = 'dus_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.REDIS_PASSWORD = '';
process.env.JWT_PRIVATE_KEY_PATH = privatePath;
process.env.JWT_PUBLIC_KEY_PATH = publicPath;
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX_ANON = '5';
process.env.RATE_LIMIT_MAX_FREE = '30';
process.env.RATE_LIMIT_MAX_PRO = '100';
process.env.BULL_CONCURRENCY = '1';
process.env.GEOIP_DB_PATH = './nonexistent.mmdb';
process.env.SHORT_CODE_LENGTH = '6';
