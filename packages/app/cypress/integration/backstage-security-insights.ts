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

describe('SecurityInsights', () => {
  beforeEach(() => {
    cy.saveGithubToken();
  });

  describe('Navigating to Security Insights', () => {
    it('should show Security Insights Releases in Overview tab', () => {
      cy.intercept(
        'GET',
        'https://api.github.com/repos/organisation/github-project-slug/code-scanning/alerts',
        { fixture: 'securityInsights/alerts.json' },
      ).as('getAlerts');

      cy.visit('/catalog/default/component/sample-service');

      cy.wait('@getAlerts');

      cy.contains('Security Insights');
      cy.contains('0 Warning');
      cy.contains('0 Error');
      cy.contains('0 Note');
      cy.contains('Open Issues');
    });

    it('should show dependabot issues when navigating to dependabot tab', () => {
      cy.intercept('POST', 'https://api.github.com/graphql', {
        fixture: 'securityInsights/graphql.json',
      }).as('postGraphql');

      cy.visit('/catalog/default/component/sample-service/dependabot');

      cy.wait('@postGraphql');

      cy.contains('serialize-javascript');
    });

    it('should show security Insights when navigating to security insights tab', () => {
      cy.intercept(
        'GET',
        'https://api.github.com/repos/organisation/github-project-slug/code-scanning/alerts?per_page=100',
        { fixture: 'securityInsights/alerts.json' },
      ).as('get100Alerts');

      cy.visit('/catalog/default/component/sample-service/security-insights');

      cy.wait('@get100Alerts');

      cy.contains('organisation/github-project-slug');
    });
  });
});
