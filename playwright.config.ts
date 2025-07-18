/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  reporter: 'html',
  testMatch: '**/e2e/**/*.test.ts',
  testIgnore: ['**/src/**', '**/node_modules/**', '**/cypress/**'],

  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 60000,
    navigationTimeout: 60000,
    trace: 'on-first-retry',
    headless: true,
    screenshot: 'only-on-failure',
    storageState: 'playwright/.auth/login.json',
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testDir: './packages/app/e2e',
      dependencies: ['setup'],
    },
  ],

  webServer: [
    {
      command: 'yarn start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'yarn start-backend',
      url: 'http://localhost:7007',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
