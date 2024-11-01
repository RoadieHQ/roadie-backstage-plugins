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
import { ANNOTATION_VIEW_URL, UserEntity } from '@backstage/catalog-model';
import { IAM, paginateListUsers } from '@aws-sdk/client-iam';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_IAM_USER_ARN } from '../annotations';
import { arnToName } from '../utils/arnToName';
import { ARN } from 'link2aws';
import { CatalogApi } from '@backstage/catalog-client';
import { LabelValueMapper } from '../utils/tags';
import { duration } from '../utils/timer';

export type AWSIAMUserProviderOptions = {
  logger: LoggerService;
  scheduler: SchedulerService;
  catalogApi?: CatalogApi;
  providerId?: string;
  ownerTag?: string;
  useTemporaryCredentials?: boolean;
  labelValueMapper?: LabelValueMapper;
};

/**
 * Provides entities from AWS IAM User service.
 */
export class AWSIAMUserProvider extends AWSEntityProvider {
  declare connection?: EntityProviderConnection;

  /** [1] */
  static fromConfig(
    config: Config,
    options: AWSIAMUserProviderOptions,
  ): AWSIAMUserProvider {
    const p = new AWSIAMUserProvider(config, options);

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
      id: 'aws-iam-user-entity-provider',
      fn: p.run,
    });

    return p;
  }

  /** [2] */
  getProviderName(): string {
    return `aws-iam-user-${this.providerId ?? 0}`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('connecting');
    this.connection = connection;
    this.scheduler.scheduleTask({
      frequency: { minutes: 5 },
      timeout: { seconds: 30 },
      id: 'aws-iam-user-entity-provider',
      fn: this.run,
    });
    await this.run();
  }

  private async getIam() {
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';
    const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(
      this.config,
    );
    const awsCredentialProvider =
      await awsCredentialsManager.getCredentialProvider({ accountId });
    return new IAM({
      region,
      credentialDefaultProvider: () =>
        awsCredentialProvider.sdkCredentialProvider,
    });
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';

    const startTimestamp = process.hrtime();

    this.logger.info(`Providing IAM user resources from AWS: ${accountId}`);
    const userResources: UserEntity[] = [];

    const iam = await this.getIam();

    const defaultAnnotations = this.buildDefaultAnnotations(
      this.config,
      accountId,
      region,
    );

    const paginatorConfig = {
      client: iam,
      pageSize: 25,
    };

    const userPages = paginateListUsers(paginatorConfig, {});

    for await (const userPage of userPages) {
      for (const user of userPage.Users || []) {
        if (user.UserName && user.Arn && user.UserId) {
          const consoleLink = new ARN(user.Arn).consoleLink;
          const userEntity: UserEntity = {
            kind: 'User',
            apiVersion: 'backstage.io/v1alpha1',
            metadata: {
              annotations: {
                ...(await defaultAnnotations),
                [ANNOTATION_AWS_IAM_USER_ARN]: user.Arn,
                [ANNOTATION_VIEW_URL]: consoleLink.toString(),
              },
              name: arnToName(user.Arn),
              title: user.UserName,
              labels: this.labelsFromTags(user.Tags),
            },
            spec: {
              profile: {
                displayName: user.Arn,
                email: user.UserName,
              },
              memberOf: [],
            },
          };

          userResources.push(userEntity);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: userResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing IAM user resources from AWS: ${accountId}`,
      {
        run_duration: duration(startTimestamp),
      },
    );
  }
}
