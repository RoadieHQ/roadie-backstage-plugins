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
/// <reference types="cypress" />
// eslint-disable-next-line no-restricted-imports
import 'os';

describe('Github Pull Requests', () => {
  beforeEach(() => {
    cy.saveGithubToken();
  });

  describe('Navigating to GitHub Pull Requests', () => {
    it('should show GitHub Pull Requests in Overview tab', () => {
      cy.intercept(
        'GET',
        'https://api.github.com/search/issues?q=state%3Aclosed%20in%3Atitle%20type%3Apr%20repo%3Aorganisation%2Fgithub-project-slug&per_page=20&page=1',
        { fixture: 'githubPRs/pull-requests.json' },
      ).as('getPulls');
      cy.visit('/catalog/default/component/sample-service');

      cy.wait('@getPulls');

      cy.contains('GitHub Pull Requests Statistics');
    });

    it('should show GitHub Pull Requests when navigating to Pull Requests tab', () => {
      cy.intercept(
        'GET',
        'https://api.github.com/search/issues?q=state%3Aopen%20%20in%3Atitle%20type%3Apr%20repo%3Aorganisation%2Fgithub-project-slug&per_page=5&page=1',
        { fixture: 'githubPRs/pull-requests.json' },
      ).as('getPulls');

      cy.visit('/catalog/default/component/sample-service/pull-requests');

      cy.wait('@getPulls');

      cy.contains('GitHub Pull Requests');
    });
  });
});
