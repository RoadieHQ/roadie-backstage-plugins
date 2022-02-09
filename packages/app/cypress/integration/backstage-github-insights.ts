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

describe('GithubInsights', () => {
    beforeEach(() => {
        cy.saveGithubToken();
        cy.intercept('GET', 'https://api.github.com/repos/organisation/github-project-slug/languages', { fixture: 'githubInsights/languages.json' })
        cy.intercept('GET', 'https://api.github.com/repos/organisation/github-project-slug/releases', { fixture: 'githubInsights/releases.json' })
        cy.intercept('GET', 'https://api.github.com/repos/organisation/github-project-slug/readme', { fixture: 'githubInsights/readme.json' })
        cy.intercept('GET', 'https://api.github.com/repos/organisation/github-project-slug/branches?protected=true', { fixture: 'githubInsights/compliance.json' })
        cy.intercept('GET', 'https://api.github.com/repos/organisation/github-project-slug/contributors?per_page=10', { fixture: 'githubInsights/contributors.json' })
    })

    describe('Navigating to GitHub Insights', () => {
        it('should show GitHub Insights Releases in Overview tab', () => {
            cy.visit('/catalog/default/component/sample-service')
            cy.contains('Releases');
        });

        it('should show GitHub Insights when navigating to Code insights tab', () => {
            cy.visit('/catalog/default/component/sample-service/code-insights')
            cy.contains('GitHub Insights');
        });
    });
});