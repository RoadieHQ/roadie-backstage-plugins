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
import { IAM, paginateListRoles } from '@aws-sdk/client-iam';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_IAM_ROLE_ARN } from '../annotations';
import { arnToName } from '../utils/arnToName';
import { ARN } from 'link2aws';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { duration } from '../utils/timer';

export type AWSIAMRoleProviderOptions = {
  logger: LoggerService;
  scheduler: SchedulerService;
  catalogApi?: CatalogApi;
  providerId?: string;
  ownerTag?: string;
  useTemporaryCredentials?: boolean;
  labelValueMapper?: LabelValueMapper;
};

/**
 * Provides entities from AWS IAM Role service.
 */
export class AWSIAMRoleProvider extends AWSEntityProvider {
  declare connection?: EntityProviderConnection;

  /** [1] */
  static fromConfig(
    config: Config,
    options: AWSIAMRoleProviderOptions,
  ): AWSIAMRoleProvider {
    const p = new AWSIAMRoleProvider(config, options);

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
      id: 'aws-iam-role-entity-provider',
      fn: p.run,
    });

    return p;
  }

  /** [2] */
  getProviderName(): string {
    return `aws-iam-role-${this.providerId ?? 0}`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('connecting');
    this.connection = connection;
    this.scheduler.scheduleTask({
      frequency: { minutes: 5 },
      timeout: { seconds: 30 },
      id: 'aws-iam-role-entity-provider',
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
      this.logger.info('Not initialized');
      throw new Error('Not initialized');
    }
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';

    const startTimestamp = process.hrtime();
    const groups = await this.getGroups();

    this.logger.info(`Providing IAM role resources from AWS: ${accountId}`);
    const roleResources: ResourceEntity[] = [];

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

    const rolePages = paginateListRoles(paginatorConfig, {});

    for await (const rolePage of rolePages) {
      for (const role of rolePage.Roles || []) {
        if (role.RoleName && role.Arn && role.RoleId) {
          const consoleLink = new ARN(role.Arn).consoleLink;
          const roleEntity: ResourceEntity = {
            kind: 'Resource',
            apiVersion: 'backstage.io/v1alpha1',
            metadata: {
              annotations: {
                ...(await defaultAnnotations),
                [ANNOTATION_AWS_IAM_ROLE_ARN]: role.Arn,
                [ANNOTATION_VIEW_URL]: consoleLink.toString(),
              },
              name: arnToName(role.Arn),
              title: role.RoleName,
              labels: this.labelsFromTags(role.Tags),
            },
            spec: {
              type: 'aws-role',
              owner: ownerFromTags(role.Tags, this.getOwnerTag(), groups),
              ...relationshipsFromTags(role.Tags),
            },
          };

          roleResources.push(roleEntity);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: roleResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${roleResources.length} IAM role resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
