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

import { ANNOTATION_VIEW_URL, ResourceEntity } from '@backstage/catalog-model';
import { Lambda, paginateListFunctions } from '@aws-sdk/client-lambda';
import * as winston from 'winston';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  ANNOTATION_AWS_IAM_ROLE_ARN,
  ANNOTATION_AWS_LAMBDA_FUNCTION_ARN,
} from '../annotations';
import { arnToName } from '../utils/arnToName';
import { ARN } from 'link2aws';
import {
  labelsFromTags,
  ownerFromTags,
  relationShipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';

/**
 * Provides entities from AWS Lambda Function service.
 */
export class AWSLambdaFunctionProvider extends AWSEntityProvider {
  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
    },
  ) {
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
    return `aws-lambda-function-${this.accountId}-${this.providerId ?? 0}`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const groups = await this.getGroups();

    this.logger.info(
      `Providing lambda function resources from aws: ${this.accountId}`,
    );

    const lambdaComponents: ResourceEntity[] = [];

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
          const consoleLink = new ARN(lambdaFunction.FunctionArn).consoleLink;
          let tags: Record<string, string> = {};
          try {
            const tagsResponse = await lambda.listTags({
              Resource: lambdaFunction.FunctionArn,
            });
            tags = tagsResponse?.Tags ?? {};
          } catch (e) {
            this.logger.warn('Unable to get tags for Lambda functions', e);
          }

          const annotations: { [name: string]: string } = {
            ...(await defaultAnnotations),
            [ANNOTATION_VIEW_URL]: consoleLink,
            [ANNOTATION_AWS_LAMBDA_FUNCTION_ARN]: lambdaFunction.FunctionArn,
          };
          if (lambdaFunction.Role) {
            annotations[ANNOTATION_AWS_IAM_ROLE_ARN] = lambdaFunction.Role;
          }
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
              labels: labelsFromTags(tags),
            },
            spec: {
              owner: ownerFromTags(tags, this.getOwnerTag(), groups),
              ...relationShipsFromTags(tags),
              type: 'lambda-function',
            },
          });
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
  }
}
