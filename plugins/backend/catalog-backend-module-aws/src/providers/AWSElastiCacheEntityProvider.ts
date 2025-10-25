/*
 * Copyright 2024 Larder Software Limited
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
import { ElastiCache } from '@aws-sdk/client-elasticache';
import { Entity } from '@backstage/catalog-model';

import { ANNOTATION_AWS_ELASTICACHE_CLUSTER_ARN } from '../annotations';
import {
  AccountConfig,
  AWSEntityProviderConfig,
  DynamicAccountConfig,
} from '../types';
import { ownerFromTags, relationshipsFromTags } from '../utils/tags';
import { duration } from '../utils/timer';

import { AWSEntityProvider } from './AWSEntityProvider';

/**
 * Provides entities from AWS ElastiCache  service.
 */
export class AWSElastiCacheEntityProvider extends AWSEntityProvider {
  private readonly elasticacheTypeValue: string;

  constructor(
    account: AccountConfig,
    options: Omit<AWSEntityProviderConfig, 'template' | 'labelValueMapper'>,
  ) {
    super(account, options);
    this.elasticacheTypeValue = 'elasticache-cluster';
  }

  getProviderName(): string {
    return `aws-elasticache-cluster-${this.providerId ?? 0}`;
  }

  private async getElastiCacheClient(
    dynamicAccountConfig?: DynamicAccountConfig,
  ) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new ElastiCache({ credentials, region })
      : new ElastiCache(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const startTimestamp = process.hrtime();
    const { accountId } = this.getParsedConfig(dynamicAccountConfig);

    this.logger.info(
      `Providing ElastiCache cluster resources from AWS: ${accountId}`,
    );
    const elasticacheResources: Entity[] = [];

    const elastiCache = await this.getElastiCacheClient(dynamicAccountConfig);

    const defaultAnnotations = await this.buildDefaultAnnotations(
      dynamicAccountConfig,
    );

    const clusters = await elastiCache.describeCacheClusters({
      ShowCacheNodeInfo: true,
    });

    if (clusters.CacheClusters) {
      for (const cluster of clusters.CacheClusters) {
        const clusterArn = cluster.ARN || '';
        const clusterName = cluster.CacheClusterId || 'unknown';
        const tags = clusterArn
          ? await elastiCache.listTagsForResource({ ResourceName: clusterArn })
          : undefined;
        const tagMap = tags?.TagList?.reduce((acc, tag) => {
          if (tag.Key && tag.Value) {
            acc[tag.Key] = tag.Value;
          }
          return acc;
        }, {} as Record<string, string>);

        // Additional metadata properties
        const clusterStatus = cluster.CacheClusterStatus || '';
        const engine = cluster.Engine || ''; // Redis or Memcached
        const engineVersion = cluster.EngineVersion || '';
        const nodeType = cluster.CacheNodeType || '';
        const endpoint =
          cluster.CacheNodes && cluster.CacheNodes[0]?.Endpoint
            ? `${cluster.CacheNodes[0].Endpoint.Address}:${cluster.CacheNodes[0].Endpoint.Port}`
            : '';
        let entity: Entity | undefined = this.renderEntity(
          { data: cluster, tags: tagMap },
          { defaultAnnotations },
        );
        if (!entity) {
          entity = {
            kind: 'Resource',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              name: clusterName.toLowerCase().replace(/[^a-zA-Z0-9\-]/g, '-'),
              title: clusterName,
              labels: {
                'aws-elasticache-region': this.region,
              },
              annotations: {
                ...defaultAnnotations,
                [ANNOTATION_AWS_ELASTICACHE_CLUSTER_ARN]: clusterArn ?? '',
              },
              status: clusterStatus,
              engine,
              engineVersion,
              nodeType,
              endpoint,
            },
            spec: {
              owner: ownerFromTags(tags?.TagList || [], this.getOwnerTag()),
              ...relationshipsFromTags(tags?.TagList || []),
              type: this.elasticacheTypeValue,
            },
          };
        }

        elasticacheResources.push(entity);
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: elasticacheResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${elasticacheResources.length} ElastiCache cluster resources from AWS: ${accountId}`,
      {
        run_duration: duration(startTimestamp),
      },
    );
  }
}
