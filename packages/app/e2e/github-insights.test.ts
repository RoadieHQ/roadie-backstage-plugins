/*
 * Copyright 2025 Larder Software Limited
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
import languagesData from './fixtures/githubInsights/languages.json';
import releasesData from './fixtures/githubInsights/releases.json';
import readmeData from './fixtures/githubInsights/readme.json';
import complianceData from './fixtures/githubInsights/compliance.json';
import contributorsData from './fixtures/githubInsights/contributors.json';

test.describe('GithubInsights', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await saveGithubToken(page);

    await page.route(
      'https://api.github.com/repos/organisation/github-project-slug/languages',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(languagesData),
        });
      },
    );

    await page.route(
      'https://api.github.com/repos/organisation/github-project-slug/releases',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(releasesData),
        });
      },
    );

    await page.route(
      'https://api.github.com/repos/organisation/github-project-slug/readme',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(readmeData),
        });
      },
    );

    await page.route(
      'https://api.github.com/repos/organisation/github-project-slug/branches?protected=true',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(complianceData),
        });
      },
    );

    await page.route(
      'https://api.github.com/repos/organisation/github-project-slug/contributors?per_page=10',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(contributorsData),
        });
      },
    );

    await page.goto('/catalog/default/component/sample-service');
  });

  test.describe('Navigating to GitHub Insights', () => {
    test('should show GitHub Insights Releases in Overview tab', async ({
      page,
    }) => {
      await expect(
        page.locator('span').filter({ hasText: 'Releases' }),
      ).toBeVisible();
    });

    test('should show GitHub Insights Languages in Overview tab', async ({
      page,
    }) => {
      await expect(page.getByText('Languages')).toBeVisible();
    });

    test('should show GitHub Insights Readme in Overview tab', async ({
      page,
    }) => {
      await expect(
        page.locator('span').filter({ hasText: 'Readme' }),
      ).toBeVisible();
    });

    test('should show GitHub Insights when navigating to Code insights tab', async ({
      page,
    }) => {
      await page.goto(
        '/catalog/default/component/sample-service/code-insights',
      );

      await expect(page.getByText('GitHub Insights')).toBeVisible();
    });
  });
});
