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
import { S3, Tag } from '@aws-sdk/client-s3';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_S3_BUCKET_ARN } from '../annotations';
import { arnToName } from '../utils/arnToName';
import { ARN } from 'link2aws';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { duration } from '../utils/timer';

export type AWSS3BucketProviderOptions = {
  logger: LoggerService;
  scheduler: SchedulerService;
  catalogApi?: CatalogApi;
  providerId?: string;
  ownerTag?: string;
  useTemporaryCredentials?: boolean;
  labelValueMapper?: LabelValueMapper;
};

/**
 * Provides entities from AWS S3 Bucket service.
 */
export class AWSS3BucketProvider extends AWSEntityProvider {
  declare connection?: EntityProviderConnection;

  /** [1] */
  static fromConfig(
    config: Config,
    options: AWSS3BucketProviderOptions,
  ): AWSS3BucketProvider {
    const p = new AWSS3BucketProvider(config, options);

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
      id: 'amazon-s3-bucket-entity-provider',
      fn: p.run,
    });

    return p;
  }

  /** [2] */
  getProviderName(): string {
    return `amazon-s3-bucket-${this.providerId ?? 0}`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('connecting');
    this.connection = connection;
    this.scheduler.scheduleTask({
      frequency: { minutes: 5 },
      timeout: { seconds: 30 },
      id: 'amazon-s3-bucket-entity-provider',
      fn: this.run,
    });
    await this.run();
  }

  private async getS3() {
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';
    const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(
      this.config,
    );
    const awsCredentialProvider =
      await awsCredentialsManager.getCredentialProvider({ accountId });
    return new S3({
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

    this.logger.info(`Providing S3 bucket resources from AWS: ${accountId}`);
    const s3Resources: ResourceEntity[] = [];

    const s3 = await this.getS3();

    const defaultAnnotations = this.buildDefaultAnnotations(
      this.config,
      accountId,
      region,
    );

    const buckets = await s3.listBuckets({});

    for (const bucket of buckets.Buckets || []) {
      if (bucket.Name) {
        const bucketArn = `arn:aws:s3:::${bucket.Name}`;
        const consoleLink = new ARN(bucketArn).consoleLink;
        let tags: Tag[] = [];
        try {
          const tagsResponse = await s3.getBucketTagging({
            Bucket: bucket.Name,
          });
          tags = tagsResponse?.TagSet ?? [];
        } catch (e) {
          this.logger.debug('No tags found for bucket', {
            bucket: bucket.Name,
          });
        }
        const resource: ResourceEntity = {
          kind: 'Resource',
          apiVersion: 'backstage.io/v1beta1',
          metadata: {
            annotations: {
              ...(await defaultAnnotations),
              [ANNOTATION_AWS_S3_BUCKET_ARN]: bucketArn,
              [ANNOTATION_VIEW_URL]: consoleLink,
            },
            name: arnToName(bucketArn),
            title: bucket.Name,
            labels: this.labelsFromTags(tags),
          },
          spec: {
            owner: ownerFromTags(tags, this.getOwnerTag(), groups),
            ...relationshipsFromTags(tags),
            type: 's3-bucket',
          },
        };

        s3Resources.push(resource);
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: s3Resources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${s3Resources.length} S3 bucket resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
