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
import organizationsData from './fixtures/Bugsnag/organisations.json';
import projectsData from './fixtures/Bugsnag/projects.json';
import errorsData from './fixtures/Bugsnag/errors.json';

test.describe('Bugsnag', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      'http://localhost:7007/api/proxy/bugsnag/api/user/organizations',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(organizationsData),
        });
      },
    );

    await page.route(
      'http://localhost:7007/api/proxy/bugsnag/api/organizations/129876sdfgh/projects?q=Test%20bugsnag%20application&per_page=50',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(projectsData),
        });
      },
    );

    await page.route(
      'http://localhost:7007/api/proxy/bugsnag/api/projects/0987qwert!!/errors?per_page=50',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(errorsData),
        });
      },
    );

    await page.goto('/catalog/default/component/sample-service/bugsnag');
  });

  test.describe('Navigating to Bugsnag', () => {
    test('should show Bugsnag when navigating to Bugsnag tab', async ({
      page,
    }) => {
      await expect(page.getByText('Description')).toBeVisible();
      await expect(page.getByText('This is a test error')).toBeVisible();
      await expect(page.getByText('Development, Test')).toBeVisible();
    });
  });
});
