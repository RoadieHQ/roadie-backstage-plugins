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
  ComponentEntity,
} from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-backend';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { Lambda } from '@aws-sdk/client-lambda';
import { STS } from '@aws-sdk/client-sts';
import { Config } from '@backstage/config';

/**
 * Provides entities from AWS Lambda Function service.
 */
export class AWSLambdaFunctionProvider implements EntityProvider {
  private readonly accountId: string;
  private readonly roleArn: string;
  private connection?: EntityProviderConnection;

  static fromConfig(config: Config) {
    return new AWSLambdaFunctionProvider(
      config.getString('accountId'),
      config.getString('roleArn'),
    );
  }

  constructor(accountId: string, roleArn: string) {
    this.accountId = accountId;
    this.roleArn = roleArn;
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

    const lambdaComponents: ComponentEntity[] = [];

    const credentials = fromTemporaryCredentials({
      params: { RoleArn: this.roleArn },
    });
    const lambda = new Lambda({ credentials });
    const sts = new STS({ credentials });

    const account = await sts.getCallerIdentity({});

    const defaultAnnotations: { [name: string]: string } = {
      [ANNOTATION_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
      [ANNOTATION_ORIGIN_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
    };

    if (account.Account) {
      defaultAnnotations['amazon.com/account-id'] = account.Account;
    }

    const functions = await lambda.listFunctions({});

    for (const lambdaFunction of functions.Functions || []) {
      if (lambdaFunction.FunctionName && lambdaFunction.FunctionArn) {
        lambdaComponents.push({
          kind: 'Component',
          apiVersion: 'backstage.io/v1beta1',
          metadata: {
            annotations: {
              ...defaultAnnotations,
              'amazon.com/lambda-arn': lambdaFunction.FunctionArn,
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
