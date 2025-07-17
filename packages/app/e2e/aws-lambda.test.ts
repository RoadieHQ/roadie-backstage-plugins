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

test.describe('AWS Lambda', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await saveGithubToken(page);

    // Load fixture data
    const awsCredentials = JSON.parse(
      readFileSync(
        join(__dirname, 'fixtures/AWSLambda/AWSCredentials.json'),
        'utf-8',
      ),
    );
    const lambdaResponse = JSON.parse(
      readFileSync(
        join(__dirname, 'fixtures/AWSLambda/AWSLambdaResponse.json'),
        'utf-8',
      ),
    );

    // Set up API mocking for AWS Lambda data
    await page.route(
      'http://localhost:7007/api/aws/credentials',
      async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(awsCredentials),
          });
        }
      },
    );

    await page.route(
      'https://lambda.eu-west-1.amazonaws.com/2015-03-31/functions/HelloWorld',
      async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(lambdaResponse),
        });
      },
    );

    await page.goto('/catalog/default/component/sample-service');
  });

  test.describe('Navigating to AWS', () => {
    test('should show HelloWorld', async ({ page }) => {
      await expect(page.getByText('HelloWorld')).toBeVisible();
    });
  });
});
