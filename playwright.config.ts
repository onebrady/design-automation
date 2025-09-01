import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  outputDir: 'reports/playwright',
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
})

