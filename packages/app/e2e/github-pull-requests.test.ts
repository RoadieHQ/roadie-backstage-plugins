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
import { saveGithubToken } from './helpers/auth';
import pullRequestsData from './fixtures/githubPRs/pull-requests.json';

test.describe('Github Pull Requests', () => {
  test.beforeEach(async ({ page }) => {
    await saveGithubToken(page);
  });

  test.describe('Navigating to GitHub Pull Requests', () => {
    test('should show GitHub Pull Requests in Overview tab', async ({
      page,
    }) => {
      await page.route(
        'https://api.github.com/search/issues?q=state%3Aclosed%20in%3Atitle%20type%3Apr%20repo%3Aorganisation%2Fgithub-project-slug&per_page=20&page=1',
        async route => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(pullRequestsData),
          });
        },
      );

      await page.goto('/catalog/default/component/sample-service');

      await expect(
        page.getByText('GitHub Pull Requests Statistics'),
      ).toBeVisible();
    });

    test('should show GitHub Pull Requests when navigating to Pull Requests tab', async ({
      page,
    }) => {
      await page.route(
        'https://api.github.com/search/issues?q=state%3Aopen%20%20in%3Atitle%20type%3Apr%20repo%3Aorganisation%2Fgithub-project-slug&per_page=5&page=1',
        async route => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(pullRequestsData),
          });
        },
      );

      await page.goto(
        '/catalog/default/component/sample-service/pull-requests',
      );

      await expect(page.getByText('GitHub Pull Requests')).toBeVisible();
    });
  });
});
