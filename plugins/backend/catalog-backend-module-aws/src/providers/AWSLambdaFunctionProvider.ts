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

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { Lambda, paginateListFunctions } from '@aws-sdk/client-lambda';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  ANNOTATION_AWS_IAM_ROLE_ARN,
  ANNOTATION_AWS_LAMBDA_FUNCTION_ARN,
} from '../annotations';
import { arnToName } from '../utils/arnToName';
import { ARN } from 'link2aws';
import { ownerFromTags, relationshipsFromTags } from '../utils/tags';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

/**
 * Provides entities from AWS Lambda Function service.
 */
export class AWSLambdaFunctionProvider extends AWSEntityProvider {
  getProviderName(): string {
    return `aws-lambda-function-${this.providerId ?? 0}`;
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
    const { accountId } = this.getParsedConfig(dynamicAccountConfig);

    const groups = await this.getGroups();

    this.logger.info(
      `Providing lambda function resources from AWS: ${accountId}`,
    );

    const lambdaComponents: Entity[] = [];

    const lambda = await this.getLambda(dynamicAccountConfig);

    const defaultAnnotations =
      this.buildDefaultAnnotations(dynamicAccountConfig);

    const paginatorConfig = {
      client: lambda,
      pageSize: 25,
    };

    const functionPages = paginateListFunctions(paginatorConfig, {});

    for await (const functionPage of functionPages) {
      for (const lambdaFunction of functionPage.Functions || []) {
        if (lambdaFunction.FunctionName && lambdaFunction.FunctionArn) {
          const consoleLink = new ARN(lambdaFunction.FunctionArn).consoleLink;
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

          const annotations: { [name: string]: string } = {
            ...(await defaultAnnotations),
            [ANNOTATION_VIEW_URL]: consoleLink,
            [ANNOTATION_AWS_LAMBDA_FUNCTION_ARN]: lambdaFunction.FunctionArn,
          };
          if (lambdaFunction.Role) {
            annotations[ANNOTATION_AWS_IAM_ROLE_ARN] = lambdaFunction.Role;
          }
          const owner = ownerFromTags(tags, this.getOwnerTag(), groups);
          const relationships = relationshipsFromTags(tags);
          this.logger.debug(
            `Setting Lambda owner from tags as ${owner} and relationships of ${JSON.stringify(
              relationships,
            )}`,
          );

          const entity: Entity | undefined = this.renderEntity(
            {
              data: lambdaFunction,
              tags,
            },
            { defaultAnnotations: await defaultAnnotations },
          );
          if (entity) {
            lambdaComponents.push(entity);
          } else {
            lambdaComponents.push({
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              metadata: {
                annotations,
                name: arnToName(lambdaFunction.FunctionArn),
                title: lambdaFunction.FunctionName,
                description: lambdaFunction.Description,
                runtime: lambdaFunction.Runtime,
                memorySize: lambdaFunction.MemorySize,
                ephemeralStorage: lambdaFunction.EphemeralStorage?.Size,
                timeout: lambdaFunction.Timeout,
                architectures: lambdaFunction.Architectures,
                labels: this.labelsFromTags(tags),
              },
              spec: {
                owner: owner,
                ...relationships,
                type: 'lambda-function',
              },
            });
          }
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: lambdaComponents.map(entity => ({
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
