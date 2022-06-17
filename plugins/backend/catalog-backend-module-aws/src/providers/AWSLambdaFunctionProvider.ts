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

import { ANNOTATION_VIEW_URL, ComponentEntity } from '@backstage/catalog-model';
import { Lambda, paginateListFunctions } from '@aws-sdk/client-lambda';
import * as winston from 'winston';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';

const link2aws = require('link2aws');

/**
 * Provides entities from AWS Lambda Function service.
 */
export class AWSLambdaFunctionProvider extends AWSEntityProvider {
  static fromConfig(config: Config, options: { logger: winston.Logger }) {
    const accountId = config.getString('accountId');
    const roleArn = config.getString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSLambdaFunctionProvider(
      { accountId, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-lambda-function-${this.accountId}`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(
      `Providing lambda function resources from aws: ${this.accountId}`,
    );

    const lambdaComponents: ComponentEntity[] = [];

    const credentials = this.getCredentials();
    const lambda = new Lambda({ credentials, region: this.region });

    const defaultAnnotations = this.buildDefaultAnnotations();

    const paginatorConfig = {
      client: lambda,
      pageSize: 25,
    };

    const functionPages = paginateListFunctions(paginatorConfig, {});

    for await (const functionPage of functionPages) {
      for (const lambdaFunction of functionPage.Functions || []) {
        if (lambdaFunction.FunctionName && lambdaFunction.FunctionArn) {
          const consoleLink = new link2aws.ARN(lambdaFunction.FunctionArn)
            .consoleLink;

          const annotations: { [name: string]: string } = {
            ...(await defaultAnnotations),
            [ANNOTATION_VIEW_URL]: consoleLink,
            'amazon.com/lambda-function-arn': lambdaFunction.FunctionArn,
          };
          if (lambdaFunction.Role) {
            annotations['amazon.com/iam-role-arn'] = lambdaFunction.Role;
          }
          lambdaComponents.push({
            kind: 'Component',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              annotations,
              name: lambdaFunction.FunctionName,
            },
            spec: {
              owner: 'unknown',
              type: 'lambda-function',
              lifecycle: 'production',
              dependsOn: [],
            },
          });
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: lambdaComponents.map(entity => ({
        entity,
        locationKey: `aws-lambda-function-provider:${this.accountId}`,
      })),
    });
  }
}
