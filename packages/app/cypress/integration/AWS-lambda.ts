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

describe('AWS Lambda', () => {
  beforeEach(() => {
    cy.saveGithubToken();
    cy.intercept('GET', 'http://localhost:7007/api/aws/credentials', {
      fixture: 'AWSLambda/AWSCredentials.json',
    }).as('getAwsCredentials');
    cy.intercept(
      'GET',
      'https://lambda.eu-west-1.amazonaws.com/2015-03-31/functions/HelloWorld',
      { fixture: 'AWSLambda/AWSLambdaResponse.json' },
    ).as('getHelloWorldLambda');
    cy.visit('/catalog/default/component/sample-service');
    cy.wait(['@getAwsCredentials', '@getHelloWorldLambda']);
  });

  describe('Navigating to AWS', () => {
    it('should show HelloWorld', () => {
      cy.contains('HelloWorld');
    });
  });
});
