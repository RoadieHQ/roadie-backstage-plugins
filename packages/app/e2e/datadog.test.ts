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

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { login, saveGithubToken } from './helpers/auth';

test.describe('Datadog', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await saveGithubToken(page);

    // Load fixture data
    const dashboardJsonData = JSON.parse(
      readFileSync(
        join(__dirname, 'fixtures/datadog/datadogdashboard.json'),
        'utf-8',
      ),
    );
    const dashboardHtmlData = readFileSync(
      join(__dirname, 'fixtures/datadog/dashboard.html'),
      'utf-8',
    );

    // Set up API mocking for Datadog endpoints
    await page.route(
      'https://p.datadoghq.eu/sb/test-datadog-link',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(dashboardJsonData),
        });
      },
    );

    await page.route(
      'https://app.datadoghq.eu/graph/embed?token=qwertytoken1234&height=300&width=600&legend=true',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: dashboardHtmlData,
        });
      },
    );
  });

  test.describe('Navigate to datadog dashboard', () => {
    test('should show Datadog dashboard', async ({ page }) => {
      await page.goto('/catalog/default/component/sample-service/datadog');

      await expect(page.getByText('Datadog dashboard')).toBeVisible();
    });

    test('should show Datadog graph', async ({ page }) => {
      await page.goto('/catalog/default/component/sample-service');

      await expect(page.getByText('Datadog Graph')).toBeVisible();
    });
  });
});
