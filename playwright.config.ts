import { defineConfig, devices } from '@playwright/test'

const isCi = !!process.env.CI
const port = isCi ? 4173 : 5173
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: isCi
    ? {
        command: 'npm run preview -- --host 127.0.0.1 --port 4173',
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120000,
      }
    : {
        command: 'npm run dev -- --host 127.0.0.1 --port 5173',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120000,
        env: {
          ...process.env,
          VITE_USE_MOCK_API: 'true',
        },
      },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
