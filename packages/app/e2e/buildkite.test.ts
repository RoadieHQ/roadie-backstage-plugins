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

/* eslint-disable no-console */

import { test, expect } from '@playwright/test';
import buildsData from './fixtures/buildkite/builds.json';
import pipelineData from './fixtures/buildkite/pipeline.json';

test.describe('Buildkite', () => {
  test.describe('When the entity is configured to display all branch builds', () => {
    test.beforeEach(async ({ page }) => {
      console.log(
        'LocalStorage check:',
        await page.evaluate(() => {
          return window.localStorage.getItem(
            '@backstage/core:SignInPage:provider',
          );
        }),
      );
      await page.route(
        'http://localhost:7007/api/proxy/buildkite/api/organizations/exampleorganization/pipelines/exampleproject/builds?page=1&per_page=5',
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
      test('should show Buildkite builds table', async ({ page }) => {
        await page.goto('/catalog/default/component/sample-service-3/ci-cd');

        await expect(page.getByText('Create PR to test')).toBeVisible();
        await expect(page.getByText('Xantier-patch-1')).toBeVisible();
      });
    });
  });

  test.describe('When the entity is configured to display the builds of a specific branch', () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        'http://localhost:7007/api/proxy/buildkite/api/organizations/exampleorganization/pipelines/exampleproject/builds?page=1&per_page=5&branch=main',
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
      test('should show Buildkite builds table limited only to builds of the specified branch', async ({
        page,
      }) => {
        await page.goto('/catalog/default/component/sample-service-4/ci-cd');

        await expect(
          page.getByText('exampleorganization/exampleproject (main)'),
        ).toBeVisible();
        await expect(page.getByText('Create PR to test')).toBeVisible();
        await expect(page.getByText('Xantier-patch-1')).toBeVisible();
      });
    });
  });

  test.describe('When the entity is configured to display default branch builds only', () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        'http://localhost:7007/api/proxy/buildkite/api/organizations/exampleorganization/pipelines/exampleproject',
        async route => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(pipelineData),
          });
        },
      );

      await page.route(
        'http://localhost:7007/api/proxy/buildkite/api/organizations/exampleorganization/pipelines/exampleproject/builds?page=1&per_page=5&branch=foo',
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
      test('should show Buildkite builds table limited to the default branch builds', async ({
        page,
      }) => {
        await page.goto('/catalog/default/component/sample-service-5/ci-cd');

        await expect(
          page.getByText('exampleorganization/exampleproject (foo)'),
        ).toBeVisible();
        await expect(page.getByText('Create PR to test')).toBeVisible();
        await expect(page.getByText('Xantier-patch-1')).toBeVisible();
      });
    });
  });
});
