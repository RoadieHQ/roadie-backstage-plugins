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

import { ResourceEntity } from '@backstage/catalog-model';
import { EKS, paginateListClusters } from '@aws-sdk/client-eks';
import * as winston from 'winston';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  ANNOTATION_AWS_EKS_CLUSTER_ARN,
  ANNOTATION_AWS_IAM_ROLE_ARN,
} from '../annotations';
import { arnToName } from '../utils/arnToName';

/**
 * Provides entities from AWS EKS Cluster service.
 */
export class AWSEKSClusterProvider extends AWSEntityProvider {
  static fromConfig(config: Config, options: { logger: winston.Logger }) {
    const accountId = config.getString('accountId');
    const roleArn = config.getString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSEKSClusterProvider(
      { accountId, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-eks-cluster-${this.accountId}`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(
      `Providing eks cluster resources from aws: ${this.accountId}`,
    );
    const s3Resources: ResourceEntity[] = [];

    const credentials = this.getCredentials();
    const eks = new EKS({ credentials, region: this.region });

    const defaultAnnotations = this.buildDefaultAnnotations();

    const paginatorConfig = {
      client: eks,
      pageSize: 25,
    };

    const clusterPages = paginateListClusters(paginatorConfig, {});

    for await (const clusterPage of clusterPages) {
      for (const name of clusterPage.clusters || []) {
        if (name) {
          const cluster = await eks.describeCluster({ name });

          const annotations: { [name: string]: string } = {
            ...(await defaultAnnotations),
          };

          if (cluster.cluster?.arn) {
            annotations[ANNOTATION_AWS_EKS_CLUSTER_ARN] = cluster.cluster?.arn;
          }

          if (cluster.cluster?.roleArn) {
            annotations[ANNOTATION_AWS_IAM_ROLE_ARN] = cluster.cluster?.roleArn;
          }

          const resource: ResourceEntity = {
            kind: 'Resource',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              annotations,
              name: arnToName(name),
              title: name,
            },
            spec: {
              owner: 'unknown',
              type: 'eks-cluster',
            },
          };

          s3Resources.push(resource);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: s3Resources.map(entity => ({
        entity,
        locationKey: `aws-eks-cluster-provider:${this.accountId}`,
      })),
    });
  }
}
