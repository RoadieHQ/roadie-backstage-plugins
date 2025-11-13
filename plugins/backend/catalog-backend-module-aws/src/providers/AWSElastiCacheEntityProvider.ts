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
import { readFileSync } from 'fs';

import { Entity } from '@backstage/catalog-model';
import { CacheCluster, ElastiCache } from '@aws-sdk/client-elasticache';
import { AWSEntityProvider } from './AWSEntityProvider';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';
import { ANNOTATION_AWS_ELASTICACHE_CLUSTER_ARN } from '../annotations';

const defaultTemplate = readFileSync(
  require.resolve('./AWSElastiCacheEntityProvider.default.yaml.njk'),
  'utf-8',
);

/**
 * Provides entities from AWS ElastiCache  service.
 */
export class AWSElastiCacheEntityProvider extends AWSEntityProvider<CacheCluster> {
  getProviderName(): string {
    return `aws-elasticache-cluster-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(
    resource: CacheCluster,
  ): Record<string, string> {
    const clusterArn = resource.ARN || '';
    return {
      [ANNOTATION_AWS_ELASTICACHE_CLUSTER_ARN]: clusterArn,
    };
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

    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(
      `Providing ElastiCache cluster resources from AWS: ${accountId}`,
    );
    const elasticacheResources: Array<Promise<Entity>> = [];

    const elastiCache = await this.getElastiCacheClient(dynamicAccountConfig);

    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    const clusters = await elastiCache.describeCacheClusters({
      ShowCacheNodeInfo: true,
    });

    if (clusters.CacheClusters) {
      for (const cluster of clusters.CacheClusters) {
        const clusterArn = cluster.ARN || '';
        const tags = clusterArn
          ? await elastiCache.listTagsForResource({ ResourceName: clusterArn })
          : undefined;

        elasticacheResources.push(
          template.render({
            data: cluster,
            tags: tags?.TagList,
          }),
        );
      }
    }

    const entities = await Promise.all(elasticacheResources);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${entities.length} ElastiCache cluster resources from AWS: ${accountId}`,
      {
        run_duration: duration(startTimestamp),
      },
    );
  }
}
