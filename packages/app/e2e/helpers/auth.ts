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

import { Page } from '@playwright/test';
import loginFixture from '../fixtures/githubLogin/login.json';

export const API_BASE_URL = 'http://localhost:7007';

export async function login(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('@backstage/core:SignInPage:provider', 'guest');
  });
  await page.goto('/');
}

export async function saveGithubToken(page: Page) {
  await page.route(
    'http://localhost:7007/api/auth/github/refresh?optional&scope=read%3Auser%20repo%20read%3Aorg&env=development',
    async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(loginFixture),
      });
    },
  );

  await page.route(
    'http://localhost:7007/api/auth/github/refresh?optional&scope=read%3Auser%20repo&env=development',
    async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(loginFixture),
      });
    },
  );
}
