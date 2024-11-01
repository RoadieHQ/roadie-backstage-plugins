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
import { ResourceEntity } from '@backstage/catalog-model';
import { EKS, paginateListClusters } from '@aws-sdk/client-eks';
import { DefaultAwsCredentialsManager } from '@backstage/integration-aws-node';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  ANNOTATION_AWS_EKS_CLUSTER_ARN,
  ANNOTATION_AWS_EKS_CLUSTER_VERSION,
  ANNOTATION_AWS_IAM_ROLE_ARN,
} from '../annotations';
import {
  ANNOTATION_KUBERNETES_API_SERVER,
  ANNOTATION_KUBERNETES_API_SERVER_CA,
  ANNOTATION_KUBERNETES_AUTH_PROVIDER,
  ANNOTATION_KUBERNETES_AWS_CLUSTER_ID,
} from '@backstage/plugin-kubernetes-common';
import { arnToName } from '../utils/arnToName';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { duration } from '../utils/timer';

export type AWSEKSClusterProviderOptions = {
  logger: LoggerService;
  scheduler: SchedulerService;
  catalogApi?: CatalogApi;
  providerId?: string;
  ownerTag?: string;
  useTemporaryCredentials?: boolean;
  labelValueMapper?: LabelValueMapper;
  clusterTypeValue?: string;
};

/**
 * Provides entities from AWS EKS Cluster service.
 */
export class AWSEKSClusterProvider extends AWSEntityProvider {
  declare connection?: EntityProviderConnection;
  private readonly clusterTypeValue: string;

  //* * [1] */
  static fromConfig(
    config: Config,
    options: AWSEKSClusterProviderOptions,
  ): AWSEKSClusterProvider {
    const p = new AWSEKSClusterProvider(config, options);

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
      id: 'amazon-eks-cluster-entity-provider',
      fn: p.run,
    });

    return p;
  }

  constructor(
    config: Config,
    options: {
      logger: LoggerService;
      scheduler: SchedulerService;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      useTemporaryCredentials?: boolean;
      labelValueMapper?: LabelValueMapper;
      clusterTypeValue?: string;
    },
  ) {
    super(config, options);
    this.clusterTypeValue = options.clusterTypeValue ?? 'eks-cluster';
  }

  /** [2] */
  getProviderName(): string {
    return `amazon-eks-cluster-${this.providerId ?? 0}`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.logger.info('connecting');
    this.connection = connection;
    this.scheduler.scheduleTask({
      frequency: { minutes: 5 },
      timeout: { seconds: 30 },
      id: 'amazon-eks-cluster-entity-provider',
      fn: this.run,
    });
    await this.run();
  }

  private async getEks() {
    const accountId = this.config.getString('accountId');
    const region = this.config.getOptionalString('region') || 'us-east-1';
    const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(
      this.config,
    );
    const awsCredentialProvider =
      await awsCredentialsManager.getCredentialProvider({ accountId });
    return new EKS({
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

    this.logger.info(`Providing EKS cluster resources from AWS: ${accountId}`);
    const eksResources: ResourceEntity[] = [];

    const eks = await this.getEks();

    const defaultAnnotations = this.buildDefaultAnnotations(
      this.config,
      accountId,
      region,
    );

    const paginatorConfig = {
      client: eks,
      pageSize: 25,
    };

    const clusterPages = paginateListClusters(paginatorConfig, {});

    for await (const clusterPage of clusterPages) {
      for (const name of clusterPage.clusters || []) {
        if (name) {
          const cluster = await eks.describeCluster({ name });
          const clusterName =
            cluster.cluster?.name
              ?.trim()
              ?.toLocaleLowerCase('en-US')
              ?.replace(/[^a-zA-Z0-9\-]/g, '-') ?? name;
          const annotations: { [name: string]: string } = {
            ...(await defaultAnnotations),
          };

          if (cluster.cluster?.version) {
            annotations[ANNOTATION_AWS_EKS_CLUSTER_VERSION] =
              cluster.cluster.version;
          }

          if (cluster.cluster?.arn) {
            annotations[ANNOTATION_AWS_EKS_CLUSTER_ARN] = cluster.cluster?.arn;
          }

          if (cluster.cluster?.roleArn) {
            annotations[ANNOTATION_AWS_IAM_ROLE_ARN] = cluster.cluster?.roleArn;
          }

          if (cluster.cluster?.endpoint) {
            annotations[ANNOTATION_KUBERNETES_API_SERVER] =
              cluster.cluster.endpoint;
          }

          if (cluster.cluster?.certificateAuthority?.data) {
            annotations[ANNOTATION_KUBERNETES_API_SERVER_CA] =
              cluster.cluster.certificateAuthority.data;
          }

          if (cluster.cluster?.name) {
            annotations[ANNOTATION_KUBERNETES_AWS_CLUSTER_ID] = clusterName;
          }

          annotations[ANNOTATION_KUBERNETES_AUTH_PROVIDER] = 'aws';

          const resource: ResourceEntity = {
            kind: 'Resource',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              annotations,
              name: arnToName(name),
              title: `${accountId}:${this.region}:${clusterName}`,
              labels: this.labelsFromTags(cluster.cluster?.tags),
            },

            spec: {
              owner: ownerFromTags(
                cluster.cluster?.tags,
                this.getOwnerTag(),
                groups,
              ),
              ...relationshipsFromTags(cluster.cluster?.tags),
              type: this.clusterTypeValue,
            },
          };

          eksResources.push(resource);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: eksResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${eksResources.length} EKS cluster resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
