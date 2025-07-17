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
import { login, saveGithubToken } from './helpers/auth';
import alertsData from './fixtures/securityInsights/alerts.json';
import graphqlData from './fixtures/securityInsights/graphql.json';

test.describe('SecurityInsights', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await saveGithubToken(page);
  });

  test.describe('Navigating to Security Insights', () => {
    test('should show Security Insights Releases in Overview tab', async ({
      page,
    }) => {
      await page.route(
        'https://api.github.com/repos/organisation/github-project-slug/code-scanning/alerts',
        async route => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(alertsData),
          });
        },
      );

      await page.goto('/catalog/default/component/sample-service');

      await expect(
        page
          .getByRole('article')
          .locator('span')
          .filter({ hasText: 'Security Insights' }),
      ).toBeVisible();
      await expect(page.getByText('Warning')).toBeVisible();
      await expect(page.getByText('Error').first()).toBeVisible();
      await expect(page.getByText('Note')).toBeVisible();
      await expect(
        page.getByRole('cell', { name: 'Open Issues' }),
      ).toBeVisible();
    });

    test('should show dependabot issues when navigating to dependabot tab', async ({
      page,
    }) => {
      await page.route('https://api.github.com/graphql', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(graphqlData),
          });
        }
      });

      await page.goto('/catalog/default/component/sample-service/dependabot');

      await expect(page.getByText('serialize-javascript')).toBeVisible();
    });

    test('should show security Insights when navigating to security insights tab', async ({
      page,
    }) => {
      await page.route(
        'https://api.github.com/repos/organisation/github-project-slug/code-scanning/alerts?per_page=100',
        async route => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(alertsData),
          });
        },
      );

      await page.goto(
        '/catalog/default/component/sample-service/security-insights',
      );

      await expect(
        page.getByText('organisation/github-project-slug'),
      ).toBeVisible();
    });
  });
});
