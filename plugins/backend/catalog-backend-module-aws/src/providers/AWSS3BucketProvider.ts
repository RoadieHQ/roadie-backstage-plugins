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
import { S3 } from '@aws-sdk/client-s3';
import * as winston from 'winston';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_S3_BUCKET_ARN } from '../annotations';
import { arnToName } from '../utils/arnToName';
import { ARN } from 'link2aws';

/**
 * Provides entities from AWS S3 Bucket service.
 */
export class AWSS3BucketProvider extends AWSEntityProvider {
  static fromConfig(config: Config, options: { logger: winston.Logger }) {
    const accountId = config.getString('accountId');
    const roleArn = config.getString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSS3BucketProvider(
      { accountId, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-s3-bucket-${this.accountId}`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(
      `Providing s3 bucket resources from aws: ${this.accountId}`,
    );
    const s3Resources: ResourceEntity[] = [];

    const credentials = this.getCredentials();
    const s3 = new S3({ credentials, region: this.region });

    const defaultAnnotations = this.buildDefaultAnnotations();

    const buckets = await s3.listBuckets({});

    for (const bucket of buckets.Buckets || []) {
      if (bucket.Name) {
        const bucketArn = `arn:aws:s3:::${bucket.Name}`;
        const consoleLink = new ARN(bucketArn).consoleLink;
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
          },
          spec: {
            owner: 'unknown',
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
        locationKey: `aws-s3-bucket-provider:${this.accountId}`,
      })),
    });
  }
}
