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

import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  ANNOTATION_VIEW_URL,
  ComponentEntity,
} from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-backend';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { Lambda } from '@aws-sdk/client-lambda';
import { STS } from '@aws-sdk/client-sts';
import * as winston from "winston";
import {Config} from "@backstage/config";
import {AccountConfig} from "../types";

const link2aws = require('link2aws');

/**
 * Provides entities from AWS Lambda Function service.
 */
export class AWSLambdaFunctionProvider implements EntityProvider {
  private readonly accountId: string;
  private readonly roleArn: string;
  private readonly externalId?: string;
  private readonly region: string;

  private connection?: EntityProviderConnection;
  private logger: winston.Logger;

  static fromConfig(config: Config, options: { logger: winston.Logger }) {
    const accountId = config.getString('accountId');
    const roleArn = config.getString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSLambdaFunctionProvider({ accountId, roleArn, externalId, region }, options)
  }

  constructor(account: AccountConfig, options: { logger: winston.Logger }) {
    this.accountId = account.accountId;
    this.roleArn = account.roleArn;
    this.externalId = account.externalId;
    this.region = account.region;
    this.logger = options.logger;
  }

  getProviderName(): string {
    return `aws-lambda-function-${this.accountId}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(`Providing lambda function resources from aws: ${this.accountId}`)

    const lambdaComponents: ComponentEntity[] = [];

      const credentials = fromTemporaryCredentials({
        params: {RoleArn: this.roleArn, ExternalId: this.externalId},
      });
      const lambda = new Lambda({ credentials, region: this.region });
      const sts = new STS({credentials});

      const account = await sts.getCallerIdentity({});

      const defaultAnnotations: { [name: string]: string } = {
        [ANNOTATION_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
        [ANNOTATION_ORIGIN_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
      };

      if (account.Account) {
        defaultAnnotations['amazon.com/account-id'] = account.Account;
      }

      const functions = await lambda.listFunctions({ });

      for (const lambdaFunction of functions.Functions || []) {
        if (lambdaFunction.FunctionName && lambdaFunction.FunctionArn) {
          const consoleLink = new link2aws.ARN(lambdaFunction.FunctionArn).consoleLink;
          lambdaComponents.push({
            kind: 'Component',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              annotations: {
                ...defaultAnnotations,
                [ANNOTATION_VIEW_URL]: consoleLink,
                'amazon.com/lambda-function-arn': lambdaFunction.FunctionArn,
              },
              name: lambdaFunction.FunctionName,
            },
            spec: {
              owner: 'unknown',
              type: 'lambda-function',
              lifecycle: 'production',
            },
          });
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
