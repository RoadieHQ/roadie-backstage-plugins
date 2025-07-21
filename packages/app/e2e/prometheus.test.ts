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
import alertsData from './fixtures/prometheus/alerts.json';
import graphsData from './fixtures/prometheus/graphs.json';
import graphs2Data from './fixtures/prometheus/graphs2.json';

test.describe('Prometheus', () => {
  test.beforeEach(async ({ page }) => {
    await saveGithubToken(page);

    // Set up API mocking for Prometheus endpoints
    await page.route(
      'http://localhost:7007/api/proxy/prometheus/api/rules?type=alert',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(alertsData),
        });
      },
    );

    await page.route(
      'http://localhost:7007/api/proxy/prometheus/api/query_range?query=node_memory_Active_bytes*',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(graphsData),
        });
      },
    );

    await page.route(
      'http://localhost:7007/api/proxy/prometheus/api/query_range?query=memUsage*',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(graphs2Data),
        });
      },
    );

    await page.goto('/catalog/default/component/sample-service-3');
  });

  test.describe('Navigate Prometheus tab', () => {
    test('should show Prometheus alerts table', async ({ page }) => {
      await page.goto('/catalog/default/component/sample-service-3/prometheus');

      await expect(page.getByText('firing')).toBeVisible();
      await expect(page.getByText('test alert name')).toBeVisible();
      await expect(
        page.getByText('alertname: Excessive Memory Usage'),
      ).toBeVisible();
      await expect(page.getByText('component: node-exporter')).toBeVisible();
      await expect(page.getByText('severity: page')).toBeVisible();
    });

    test('should show Prometheus graphs for two rules defined in catalog-info', async ({
      page,
    }) => {
      await page.goto('/catalog/default/component/sample-service-3/prometheus');

      await expect(page.getByText('node_memory_Active_bytes')).toBeVisible();
      await expect(page.getByText('memUsage').first()).toBeVisible();
      await expect(
        page
          .locator('.recharts-legend-item-text')
          .filter({ hasText: 'memUsage' }),
      ).toBeVisible();
      await expect(
        page
          .locator('.recharts-legend-item-text')
          .filter({ hasText: 'test-instance' }),
      ).toBeVisible();
    });
  });
});
