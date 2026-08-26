import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.WEB_ADMIN_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: 'npm run start:dev -w @hris/api',
          url: 'http://localhost:3000/health',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          cwd: '..',
          env: {
            ...process.env,
            AUTH_DEV_BYPASS: 'true',
            DATABASE_URL:
              process.env.DATABASE_URL ??
              'postgresql://hris:hris@localhost:5432/hris_lab?schema=public',
            PORT: '3000',
            STORAGE_DRIVER: 'local',
            LOCAL_UPLOAD_DIR: 'data/uploads',
          },
        },
        {
          command: 'npm run dev -w @hris/web-admin',
          url: 'http://localhost:5173',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          cwd: '..',
        },
        {
          command: 'npm run dev -w @hris/web-onboarding',
          url: 'http://localhost:5174',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          cwd: '..',
        },
      ],
});
