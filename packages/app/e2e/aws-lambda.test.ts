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
import awsCredentials from './fixtures/AWSLambda/AWSCredentials.json';
import lambdaResponse from './fixtures/AWSLambda/AWSLambdaResponse.json';

test.describe('AWS Lambda', () => {
  test.beforeEach(async ({ page }) => {
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
