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
import buildsData from './fixtures/travisCi/builds.json';

test.describe('Travis CI', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      'http://localhost:7007/api/proxy/travisci/api/repo/RoadieHQ%2Fsample-service/builds?offset=0&limit=5',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildsData),
        });
      },
    );
  });

  test.describe('Navigate to CI/CD dashboard', () => {
    test('should show Travis CI table', async ({ page }) => {
      await page.goto('/catalog/default/component/sample-service-2/ci-cd');

      await expect(page.getByText('All builds')).toBeVisible();
      await expect(
        page.getByText('Playwright test Commit message'),
      ).toBeVisible();
    });

    test('should show Travis CI build card', async ({ page }) => {
      await page.goto('/catalog/default/component/sample-service-2');

      await expect(page.getByText('Recent Travis-CI Builds')).toBeVisible();
    });
  });
});
