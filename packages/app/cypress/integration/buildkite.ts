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

describe('Buildkite', () => {
  describe('When the entity is configured to display all branch builds', () => {
    beforeEach(() => {
      cy.login();
      cy.saveGithubToken();
      cy.intercept(
        'GET',
        'http://localhost:7007/api/proxy/buildkite/api/organizations/exampleorganization/pipelines/exampleproject/builds?page=1&per_page=5',
        { fixture: 'buildkite/builds.json' },
      ).as('getBuilds');
    });

    describe('Navigate to CI/CD dashboard', () => {
      it('should show Buildkite builds table', () => {
        cy.visit('/catalog/default/component/sample-service-3/ci-cd');

        cy.wait('@getBuilds');

        cy.contains('Create PR to test');
        cy.contains('Xantier-patch-1');
      });
    });
  });

  describe('When the entity is configured to display the builds of a specific branch', () => {
    beforeEach(() => {
      cy.login();
      cy.saveGithubToken();
      cy.intercept(
        'GET',
        'http://localhost:7007/api/proxy/buildkite/api/organizations/exampleorganization/pipelines/exampleproject/builds?page=1&per_page=5&branch=main',
        { fixture: 'buildkite/builds.json' },
      ).as('getBuilds');
    });

    describe('Navigate to CI/CD dashboard', () => {
      it('should show Buildkite builds table limited only to builds of the specified branch', () => {
        cy.visit('/catalog/default/component/sample-service-4/ci-cd');

        cy.wait('@getBuilds');

        cy.contains('exampleorganization/exampleproject (main)');
        cy.contains('Create PR to test');
        cy.contains('Xantier-patch-1');
      });
    });
  });

  describe('When the entity is configured to display default branch builds only', () => {
    beforeEach(() => {
      cy.login();
      cy.saveGithubToken();
      cy.intercept(
        'GET',
        'http://localhost:7007/api/proxy/buildkite/api/organizations/exampleorganization/pipelines/exampleproject',
        { fixture: 'buildkite/pipeline.json' },
      ).as('getPipeline');
      cy.intercept(
        'GET',
        'http://localhost:7007/api/proxy/buildkite/api/organizations/exampleorganization/pipelines/exampleproject/builds?page=1&per_page=5&branch=foo',
        { fixture: 'buildkite/builds.json' },
      ).as('getBuilds');
    });

    describe('Navigate to CI/CD dashboard', () => {
      it('should show Buildkite builds table limited to the default branch builds', () => {
        cy.visit('/catalog/default/component/sample-service-5/ci-cd');

        cy.wait(['@getPipeline', '@getBuilds']);

        cy.contains('exampleorganization/exampleproject (foo)');
        cy.contains('Create PR to test');
        cy.contains('Xantier-patch-1');
      });
    });
  });
});
