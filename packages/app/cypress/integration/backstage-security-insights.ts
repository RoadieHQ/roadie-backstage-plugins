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
        cy.intercept('GET', 'https://api.github.com/repos/organisation/github-project-slug/code-scanning/alerts', { fixture: 'securityInsights/alerts.json' })
        cy.intercept('GET', 'https://api.github.com/repos/organisation/github-project-slug/code-scanning/alerts?per_page=100', { fixture: 'securityInsights/alerts.json' })
        cy.intercept('POST', 'https://api.github.com/graphql', { fixture: 'securityInsights/graphql.json' })
        cy.visit('/catalog/default/component/sample-service')
    })

    describe('Navigating to Security Insights', () => {
        it('should show Security Insights Releases in Overview tab', () => {
            cy.contains('Security Insights');
            cy.contains('0 Warning')
            cy.contains('0 Error')
            cy.contains('0 Note')
            cy.contains('Open Issues')
        });

        it('should show dependabot issues when navigating to dependabot tab', () => {
            cy.visit('/catalog/default/component/sample-service/dependabot')
            cy.contains('serialize-javascript');
        });

        it('should show security Insights when navigating to security insights tab', () => {
            cy.visit('/catalog/default/component/sample-service/security-insights')
            cy.contains('organisation/github-project-slug');
        });
    });
});