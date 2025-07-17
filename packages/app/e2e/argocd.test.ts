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
import { login } from './helpers/auth';
import applicationData from './fixtures/ArgoCD/applications-test-app.json';
import revisionData from './fixtures/ArgoCD/deploy-history-data.json';

test.describe('Argo CD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);

    await page.route(
      'http://localhost:7007/api/proxy/argocd/api/applications/test-app',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(applicationData),
        });
      },
    );

    await page.route(
      'http://localhost:7007/api/proxy/argocd/api/applications/test-app/revisions/53e28ff20cc530b9ada2173fbbd64d48338583ba/metadata',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(revisionData),
        });
      },
    );

    await page.goto('/catalog/default/component/sample-service');
  });

  test.describe('Navigate to Overview', () => {
    test('should show the ArgoCD History card', async ({ page }) => {
      await expect(page.getByText('ArgoCD history')).toBeVisible();
      await expect(page.getByRole('link', { name: 'test-app' })).toBeVisible();
      await expect(
        page.getByText('53e28ff20cc530b9ada2173fbbd64d48338583ba'),
      ).toBeVisible();
      await expect(page.getByText('test-user')).toBeVisible();
      await expect(page.getByText('Update README.md')).toBeVisible();
    });

    test('should show ArgoCD app details card', async ({ page }) => {
      await expect(page.getByText('ArgoCD overview')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'test-app' }),
      ).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Synced' })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'Healthy' })).toBeVisible();
    });
  });

  test.describe('Navigate to argocd tab', () => {
    test('should show the ArgoCD History table', async ({ page }) => {
      await page.getByTestId('header-tab-13').click();

      await expect(page.getByText('ArgoCD history')).toBeVisible();
      await expect(page.getByText('test-app')).toBeVisible();
      await expect(
        page.getByText('53e28ff20cc530b9ada2173fbbd64d48338583ba'),
      ).toBeVisible();
    });
  });
});
