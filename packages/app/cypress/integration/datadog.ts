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

describe('Datadog', () => {
  beforeEach(() => {
    cy.saveGithubToken();
    cy.intercept('GET', 'https://p.datadoghq.eu/sb/test-datadog-link', {
      fixture: 'datadog/datadogdashboard.json',
    }).as('getDashboardJson');
    cy.intercept(
      'GET',
      'https://app.datadoghq.eu/graph/embed?token=qwertytoken1234&height=300&width=600&legend=true',
      { fixture: 'datadog/dashboard.html' },
    ).as('getDashboardHtml');
  });

  describe('Navigate to datadog dashboard', () => {
    it('should show Datadog dashboard', () => {
      cy.visit('/catalog/default/component/sample-service/datadog');

      cy.wait('@getDashboardJson');

      cy.contains('Datadog dashboard');
    });

    it('should show Datadog graph', () => {
      cy.visit('/catalog/default/component/sample-service');

      cy.wait('@getDashboardHtml');

      cy.contains('Datadog Graph');
    });
  });
});
