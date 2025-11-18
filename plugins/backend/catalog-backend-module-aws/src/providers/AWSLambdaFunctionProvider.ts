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
import { readFileSync } from 'fs';

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import {
  FunctionConfiguration,
  Lambda,
  paginateListFunctions,
} from '@aws-sdk/client-lambda';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  ANNOTATION_AWS_IAM_ROLE_ARN,
  ANNOTATION_AWS_LAMBDA_FUNCTION_ARN,
} from '../annotations';
import { ARN } from 'link2aws';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

const defaultTemplate = readFileSync(
  require.resolve('./AWSLambdaFunctionProvider.default.yaml.njk'),
  'utf-8',
);

/**
 * Provides entities from AWS Lambda Function service.
 */
export class AWSLambdaFunctionProvider extends AWSEntityProvider<FunctionConfiguration> {
  getProviderName(): string {
    return `aws-lambda-function-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(
    resource: FunctionConfiguration,
  ): Record<string, string> {
    const annotations: Record<string, string> = {
      [ANNOTATION_VIEW_URL]: new ARN(resource.FunctionArn!).consoleLink,
      [ANNOTATION_AWS_LAMBDA_FUNCTION_ARN]: resource.FunctionArn!,
    };
    if (resource.Role) {
      annotations[ANNOTATION_AWS_IAM_ROLE_ARN] = resource.Role;
    }
    return annotations;
  }

  private async getLambda(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new Lambda({ credentials, region })
      : new Lambda(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const startTimestamp = process.hrtime();
    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(
      `Providing lambda function resources from AWS: ${accountId}`,
    );
    const lambdaComponents: Array<Promise<Entity>> = [];

    const lambda = await this.getLambda(dynamicAccountConfig);
    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    const paginatorConfig = {
      client: lambda,
      pageSize: 25,
    };

    const functionPages = paginateListFunctions(paginatorConfig, {});

    for await (const functionPage of functionPages) {
      for (const lambdaFunction of functionPage.Functions || []) {
        if (lambdaFunction.FunctionName && lambdaFunction.FunctionArn) {
          let tags: Record<string, string> = {};
          try {
            const tagsResponse = await lambda.listTags({
              Resource: lambdaFunction.FunctionArn,
            });
            tags = tagsResponse?.Tags ?? {};
          } catch (e) {
            this.logger.warn(
              'Unable to get tags for Lambda functions',
              e as Error,
            );
          }

          // Render entity using template
          lambdaComponents.push(
            template.render({
              data: lambdaFunction,
              tags,
            }),
          );
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: (
        await Promise.all(lambdaComponents)
      ).map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${lambdaComponents.length} lambda function resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
