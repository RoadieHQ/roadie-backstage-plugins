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

describe('Prometheus', () => {
  beforeEach(() => {
    cy.saveGithubToken();
    cy.intercept(
      'GET',
      'http://localhost:7007/api/proxy/prometheus/api/rules?type=alert',
      { fixture: 'prometheus/alerts.json' },
    ).as('getAlerts');
    cy.visit('/catalog/default/component/sample-service-3');

    cy.wait('@getAlerts');

    cy.intercept(
      'GET',
      'http://localhost:7007/api/proxy/prometheus/api/query_range?query=node_memory_Active_bytes*',
      { fixture: 'prometheus/graphs.json' },
    ).as('getGraphs');
    cy.intercept(
      'GET',
      'http://localhost:7007/api/proxy/prometheus/api/query_range?query=memUsage*',
      { fixture: 'prometheus/graphs2.json' },
    ).as('getGraphs2');
  });

  describe('Navigate Prometheus tab', () => {
    it('should show Prometheus alerts table', () => {
      cy.visit('/catalog/default/component/sample-service-3/prometheus');

      cy.wait(['@getGraphs', '@getGraphs2']);

      cy.contains('firing');
      cy.contains('test alert name');
      cy.contains('alertname: Excessive Memory Usage');
      cy.contains('component: node-exporter');
      cy.contains('severity: page');
    });
    it('should show Prometheus graphs for two rules defined in catalog-info', () => {
      cy.visit('/catalog/default/component/sample-service-3/prometheus');

      cy.wait(['@getGraphs', '@getGraphs2']);

      cy.contains('node_memory_Active_bytes');
      cy.contains('memUsage');
      cy.get('.recharts-legend-item-text').contains('memUsage');
      cy.get('.recharts-legend-item-text').contains('test-instance');
    });
  });
});
