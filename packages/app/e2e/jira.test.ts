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

test.describe('Jira plugin', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await saveGithubToken(page);

    // Load fixture data
    const projectData = JSON.parse(
      readFileSync(join(__dirname, 'fixtures/jira/project.json'), 'utf-8'),
    );
    const searchResultData = JSON.parse(
      readFileSync(join(__dirname, 'fixtures/jira/searchresult.json'), 'utf-8'),
    );
    const activityStreamData = readFileSync(
      join(__dirname, 'fixtures/jira/activitystream.xml'),
      'utf-8',
    );
    const statusesData = JSON.parse(
      readFileSync(join(__dirname, 'fixtures/jira/statuses.json'), 'utf-8'),
    );

    // Set up API mocking for Jira endpoints
    await page.route(
      'http://localhost:7007/api/proxy/jira/api/rest/api/latest/project/TEST',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(projectData),
        });
      },
    );

    await page.route(
      'http://localhost:7007/api/proxy/jira/api/rest/api/latest/search/jql',
      async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(searchResultData),
          });
        }
      },
    );

    await page.route(
      'http://localhost:7007/api/proxy/jira/api/activity?maxResults=25&streams=key+IS+TEST&streams=issue-key+IS+10003+10004&os_authType=basic',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/xml',
          body: activityStreamData,
        });
      },
    );

    await page.route(
      'http://localhost:7007/api/proxy/jira/api/rest/api/latest/project/TEST/statuses',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(statusesData),
        });
      },
    );

    await page.goto('/catalog/default/component/sample-service');
  });

  test.describe('Navigating to Jira Overview', () => {
    test('should show Jira in Overview tab', async ({ page }) => {
      await expect(
        page.getByText('Activity stream', { exact: false }),
      ).toBeVisible();
      await expect(
        page.getByText(
          "John Doe added the Component 'COMP' to TEST-2 - test2 4 years ago",
        ),
      ).toBeVisible();

      await page.locator('#select-statuses').click();
      await expect(
        page.locator('[data-value="Selected for Development"]'),
      ).toBeVisible();
    });
  });

  test.describe('EntityJiraQueryCard', () => {
    test.beforeEach(async ({ page }) => {
      const jqlQueryResultData = JSON.parse(
        readFileSync(
          join(__dirname, 'fixtures/jira/jqlQueryResult.json'),
          'utf-8',
        ),
      );

      await page.route(
        'http://localhost:7007/api/proxy/jira/api/rest/api/latest/search/jql',
        async route => {
          if (route.request().method() === 'POST') {
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(jqlQueryResultData),
            });
          }
        },
      );

      await page.goto('/catalog/default/component/sample-service/jira');
    });

    test('should show the JQL response', async ({ page }) => {
      await expect(
        page
          .getByRole('cell', { name: '[Sample] Administrator access' })
          .first(),
      ).toBeVisible();
    });
  });
});
