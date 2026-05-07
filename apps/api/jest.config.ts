import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  // Runs BEFORE modules are loaded — sets env vars so Zod validation in env.ts passes
  setupFiles: ['<rootDir>/tests/env-preload.js'],
  // Runs after Jest env is set up — connects DB, cleans collections
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^ioredis$': '<rootDir>/tests/__mocks__/ioredis.ts',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
  coverageReporters: ['text', 'lcov'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
};

export default config;
