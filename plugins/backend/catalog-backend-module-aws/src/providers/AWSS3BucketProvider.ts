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
import { S3, Tag } from '@aws-sdk/client-s3';
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';
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
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

/**
 * Provides entities from AWS S3 Bucket service.
 */
export class AWSS3BucketProvider extends AWSEntityProvider {
  static fromConfig(
    config: Config,
    options: {
      logger: Logger | LoggerService;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      useTemporaryCredentials?: boolean;
      labelValueMapper?: LabelValueMapper;
    },
  ) {
    const accountId = config.getString('accountId');
    const roleName = config.getString('roleName');
    const roleArn = config.getOptionalString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSS3BucketProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-s3-bucket-${this.providerId ?? 0}`;
  }

  private async getS3(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new S3({ credentials, region })
      : new S3(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const startTimestamp = process.hrtime();
    const { accountId } = this.getParsedConfig(dynamicAccountConfig);
    const groups = await this.getGroups();

    this.logger.info(`Providing S3 bucket resources from AWS: ${accountId}`);
    const s3Resources: ResourceEntity[] = [];

    const s3 = await this.getS3(dynamicAccountConfig);

    const defaultAnnotations =
      this.buildDefaultAnnotations(dynamicAccountConfig);

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
