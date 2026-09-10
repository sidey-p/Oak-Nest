import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
    viewport: { width: 1366, height: 850 },
    actionTimeout: 10000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
