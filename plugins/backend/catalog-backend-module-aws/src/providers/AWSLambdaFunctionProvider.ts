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
  LoggerService,
  SchedulerService,
  readSchedulerServiceTaskScheduleDefinitionFromConfig,
} from '@backstage/backend-plugin-api';
import { EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { ANNOTATION_VIEW_URL, ResourceEntity } from '@backstage/catalog-model';
import { Lambda, paginateListFunctions } from '@aws-sdk/client-lambda';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  ANNOTATION_AWS_IAM_ROLE_ARN,
  ANNOTATION_AWS_LAMBDA_FUNCTION_ARN,
} from '../annotations';
import { arnToName } from '../utils/arnToName';
import { ARN } from 'link2aws';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { duration } from '../utils/timer';

export type AWSLambdaFunctionProviderOptions = {
  logger: LoggerService;
  scheduler: SchedulerService;
  catalogApi?: CatalogApi;
  providerId?: string;
  ownerTag?: string;
  useTemporaryCredentials?: boolean;
  labelValueMapper?: LabelValueMapper;
};

/**
 * Provides entities from AWS Lambda Function service.
 */
export class AWSLambdaFunctionProvider extends AWSEntityProvider {
  declare connection?: EntityProviderConnection;

  /** [1] */
  static fromConfig(
    config: Config,
    options: AWSLambdaFunctionProviderOptions,
  ): AWSLambdaFunctionProvider {
    const p = new AWSLambdaFunctionProvider(config, options);

    const defaultSchedule = {
      frequency: { minutes: 120 },
      timeout: { minutes: 60 },
      initialDelay: { seconds: 30 },
    };

    const schedule = config.has('schedule')
      ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
          config.getConfig('schedule'),
        )
      : defaultSchedule;

    options.scheduler.scheduleTask({
      frequency: schedule.frequency,
      timeout: schedule.timeout,
      initialDelay: schedule.initialDelay,
      id: 'aws-lambda-function-entity-provider',
      fn: p.run,
    });

    return p;
  }

  /** [2] */
  getProviderName(): string {
    return `aws-lambda-function-${this.providerId ?? 0}`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('connecting');
    this.connection = connection;
    this.scheduler.scheduleTask({
      frequency: { seconds: 5 },
      timeout: { seconds: 30 },
      id: 'aws-lambda-function-entity-provider',
      fn: this.run,
    });
    await this.run();
  }

  private async getLambda() {
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';
    const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(
      this.config,
    );
    const awsCredentialProvider =
      await awsCredentialsManager.getCredentialProvider({ accountId });
    return new Lambda({
      region,
      credentialDefaultProvider: () =>
        awsCredentialProvider.sdkCredentialProvider,
    });
  }

  /** [4] */
  async run(): Promise<void> {
    if (!this.connection) {
      this.logger.info('Not initialized');
      throw new Error('Not initialized');
    }
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';

    const startTimestamp = process.hrtime();
    const groups = await this.getGroups();

    this.logger.info(
      `Providing lambda function resources from AWS: ${accountId}`,
    );
    const lambdaComponents: ResourceEntity[] = [];

    const lambda = await this.getLambda();

    const defaultAnnotations = this.buildDefaultAnnotations(
      this.config,
      accountId,
      region,
    );

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
            this.logger.warn(`Unable to get tags for Lambda functions\n{e}`);
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
              labels: this.labelsFromTags(tags),
            },
            spec: {
              owner: ownerFromTags(tags, this.getOwnerTag(), groups),
              ...relationshipsFromTags(tags),
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

    this.logger.info(
      `Finished providing ${lambdaComponents.length} lambda function resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
