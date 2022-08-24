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

describe('Bugsnag', () => {
  beforeEach(() => {
    cy.saveGithubToken();
    cy.intercept(
      'GET',
      'http://localhost:7007/api/proxy/bugsnag/api/user/organizations',
      { fixture: 'Bugsnag/organisations.json' },
    ).as('getOrganizations');
    cy.intercept(
      'GET',
      'http://localhost:7007/api/proxy/bugsnag/api/organizations/129876sdfgh/projects?per_page=50',
      { fixture: 'Bugsnag/projects.json' },
    ).as('getProjects');
    cy.intercept(
      'GET',
      'http://localhost:7007/api/proxy/bugsnag/api/projects/0987qwert!!/errors?per_page=50',
      { fixture: 'Bugsnag/errors.json' },
    ).as('getErrors');

    cy.visit('/catalog/default/component/sample-service/bugsnag');

    cy.wait(['@getOrganizations', '@getProjects', '@getErrors']);
  });

  describe('Navigating to Bugsnag', () => {
    it('should show Bugsnag when navigating to Bugsnag tab', () => {
      cy.contains('Errors overview');
    });
  });
});
