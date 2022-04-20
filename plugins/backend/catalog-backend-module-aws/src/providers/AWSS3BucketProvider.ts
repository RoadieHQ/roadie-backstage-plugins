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
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  ResourceEntity,
} from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-backend';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { S3 } from '@aws-sdk/client-s3';
import { STS } from '@aws-sdk/client-sts';
import { Config } from '@backstage/config';

/**
 * Provides entities from AWS S3 Bucket service.
 */
export class AWSS3BucketProvider implements EntityProvider {
  private readonly accountId: string;
  private readonly roleArn: string;
  private connection?: EntityProviderConnection;

  static fromConfig(config: Config) {
    return new AWSS3BucketProvider(
      config.getString('accountId'),
      config.getString('roleArn'),
    );
  }

  constructor(accountId: string, roleArn: string) {
    this.accountId = accountId;
    this.roleArn = roleArn;
  }

  getProviderName(): string {
    return `aws-s3-bucket-${this.accountId}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const s3Resources: ResourceEntity[] = [];

    const credentials = fromTemporaryCredentials({
      params: { RoleArn: this.roleArn },
    });
    const s3 = new S3({ credentials });
    const sts = new STS({ credentials });

    const account = await sts.getCallerIdentity({});

    const defaultAnnotations: { [name: string]: string } = {
      [ANNOTATION_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
      [ANNOTATION_ORIGIN_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
    };

    if (account.Account) {
      defaultAnnotations['amazon.com/account-id'] = account.Account;
    }

    const buckets = await s3.listBuckets({});

    for (const bucket of buckets.Buckets || []) {
      if (bucket.Name) {
        const annotations = JSON.parse(JSON.stringify(defaultAnnotations));
        annotations[
          'amazon.com/s3-bucket-arn'
        ] = `arn:aws:s3:::bucket_name/${bucket.Name}`;
        s3Resources.push({
          kind: 'Resource',
          apiVersion: 'backstage.io/v1beta1',
          metadata: {
            annotations,
            name: bucket.Name,
          },
          spec: {
            owner: 'unknown',
            type: 's3-bucket',
          },
        });
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
