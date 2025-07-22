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

import { Entity } from '@backstage/catalog-model';
import { EKS, paginateListClusters } from '@aws-sdk/client-eks';
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';
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
import { AccountConfig, DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

/**
 * Provides entities from AWS EKS Cluster service.
 */
export class AWSEKSClusterProvider extends AWSEntityProvider {
  private readonly clusterTypeValue: string;

  static fromConfig(
    config: Config,
    options: {
      logger: Logger | LoggerService;
      template?: string;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      useTemporaryCredentials?: boolean;
      labelValueMapper?: LabelValueMapper;
      clusterTypeValue?: string;
    },
  ) {
    const accountId = config.getString('accountId');
    const roleName = config.getString('roleName');
    const roleArn = config.getOptionalString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSEKSClusterProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  constructor(
    account: AccountConfig,
    options: {
      logger: Logger | LoggerService;
      template?: string;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      useTemporaryCredentials?: boolean;
      labelValueMapper?: LabelValueMapper;
      clusterTypeValue?: string;
    },
  ) {
    super(account, options);
    this.clusterTypeValue = options.clusterTypeValue ?? 'eks-cluster';
  }

  getProviderName(): string {
    return `aws-eks-cluster-${this.providerId ?? 0}`;
  }

  private async getEks(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new EKS({ credentials, region })
      : new EKS(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const startTimestamp = process.hrtime();
    const { accountId } = this.getParsedConfig(dynamicAccountConfig);
    const groups = await this.getGroups();

    this.logger.info(`Providing EKS cluster resources from AWS: ${accountId}`);
    const eksEntities: Entity[] = [];

    const eks = await this.getEks(dynamicAccountConfig);

    const defaultAnnotations =
      this.buildDefaultAnnotations(dynamicAccountConfig);

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
            annotations[ANNOTATION_AWS_EKS_CLUSTER_ARN] = cluster.cluster.arn;
          }

          if (cluster.cluster?.roleArn) {
            annotations[ANNOTATION_AWS_IAM_ROLE_ARN] = cluster.cluster.roleArn;
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

          const labels = this.labelsFromTags(cluster.cluster?.tags);
          let entity: Entity | undefined = this.renderEntity({
            data: cluster.cluster,
          });
          if (!entity) {
            entity = {
              kind: 'Resource',
              apiVersion: 'backstage.io/v1beta1',
              metadata: {
                annotations,
                name: arnToName(name),
                title: `${accountId}:${this.region}:${clusterName}`,
                labels,
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
          }

          eksEntities.push(entity);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: eksEntities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${eksEntities.length} EKS cluster resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
