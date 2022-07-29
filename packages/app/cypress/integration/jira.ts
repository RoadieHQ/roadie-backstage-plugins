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

describe('Jira plugin', () => {
  beforeEach(() => {
    cy.saveGithubToken();
    cy.intercept(
      'GET',
      'http://localhost:7007/api/proxy/jira/api/rest/api/latest/project/TEST',
      { fixture: 'jira/project.json' },
    ).as('getProject');
    cy.intercept(
      'POST',
      'http://localhost:7007/api/proxy/jira/api/rest/api/latest/search',
      { fixture: 'jira/searchresult.json' },
    ).as('postSearchResult');

    cy.intercept(
      'GET',
      'http://localhost:7007/api/proxy/jira/api/activity?maxResults=25&streams=key+IS+TEST&streams=issue-key+IS+10003+10004&os_authType=basic',
      { fixture: 'jira/activitystream.xml' },
    ).as('getActivity');
    cy.intercept(
      'GET',
      'http://localhost:7007/api/proxy/jira/api/rest/api/latest/project/TEST/statuses',
      { fixture: 'jira/statuses.json' },
    ).as('getStatuses');

    cy.visit('/catalog/default/component/sample-service');

    cy.wait('@getProject');
    cy.wait('@postSearchResult');
    cy.wait(['@getActivity', '@getStatuses']);
  });

  describe('Navigating to Jira Overview', () => {
    it('should show Jira in Overview tab', () => {
      cy.contains('Activity stream');

      cy.contains('John Doe added');

      cy.get('#select-statuses').click();
      cy.get('[data-value="Selected for Development"]');
    });
  });
});
