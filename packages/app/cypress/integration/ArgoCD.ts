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

describe('Argo CD', () => {
  beforeEach(() => {
    cy.saveGithubToken();
    cy.intercept(
      'GET',
      'http://localhost:7007/api/proxy/argocd/api/applications/test-app',
      { fixture: 'ArgoCD/applications-test-app.json' },
    ).as('getArgoData');
    cy.visit('/catalog/default/component/sample-service');
    cy.wait('@getArgoData');
  });

  describe('Navigate to Overview', () => {
    it('should show the ArgoCD History card', () => {
      cy.contains('ArgoCD history');
      cy.contains('test-app');
      cy.contains('53e28ff20cc530b9ada2173fbbd64d48338583ba');
    });

    it('should show ArgoCD app details card', () => {
      cy.contains('ArgoCD overview');
      cy.contains('test-app');
      cy.contains('Synced');
      cy.contains('Healthy');
    });
  });

  describe('Navigate to argocd tab', () => {
    it('should show the ArgoCD History table', () => {
      cy.contains('ArgoCD history');
      cy.contains('test-app');
      cy.contains('53e28ff20cc530b9ada2173fbbd64d48338583ba');
    });
  });
});
