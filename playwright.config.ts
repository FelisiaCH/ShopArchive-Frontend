import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:5173';

// Playwright's bundled Chromium has no build for older macOS. Setting PLAYWRIGHT_CHANNEL=chrome
// runs the suite against the Chrome already installed on the machine instead.
const channel = process.env.PLAYWRIGHT_CHANNEL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  // Every screen is checked at a phone width and a desktop width, so both are projects rather
  // than something to remember to do by hand.
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'], channel } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
  },
});
