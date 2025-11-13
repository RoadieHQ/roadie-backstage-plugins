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
import { Bucket, S3, Tag } from '@aws-sdk/client-s3';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_S3_BUCKET_ARN } from '../annotations';
import { ARN } from 'link2aws';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

const defaultTemplate = readFileSync(
  require.resolve('./AWSS3BucketProvider.default.yaml.njk'),
  'utf-8',
);

/**
 * Provides entities from AWS S3 Bucket service.
 */
export class AWSS3BucketProvider extends AWSEntityProvider<Bucket> {
  getProviderName(): string {
    return `aws-s3-bucket-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(bucket: Bucket): Record<string, string> {
    const bucketArn = `arn:aws:s3:::${bucket.Name}`;
    const consoleLink = new ARN(bucketArn).consoleLink;
    return {
      [ANNOTATION_AWS_S3_BUCKET_ARN]: bucketArn,
      [ANNOTATION_VIEW_URL]: consoleLink.toString(),
    };
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
    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(`Providing S3 bucket resources from AWS: ${accountId}`);
    const s3Resources: Array<Promise<Entity>> = [];

    const s3 = await this.getS3(dynamicAccountConfig);

    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    const buckets = await s3.listBuckets({});

    for (const bucket of buckets.Buckets || []) {
      if (bucket.Name) {
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

        s3Resources.push(
          template.render({
            data: bucket,
            tags,
          }),
        );
      }
    }

    const entities = await Promise.all(s3Resources);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${entities.length} S3 bucket resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
