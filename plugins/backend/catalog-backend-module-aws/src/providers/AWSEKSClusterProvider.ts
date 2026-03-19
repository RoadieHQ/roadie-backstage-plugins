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

import { Cluster, EKS, paginateListClusters } from '@aws-sdk/client-eks';
import { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import {
  ANNOTATION_KUBERNETES_API_SERVER,
  ANNOTATION_KUBERNETES_API_SERVER_CA,
} from '@backstage/plugin-kubernetes-common';

import {
  ANNOTATION_AWS_EKS_CLUSTER_ARN,
  ANNOTATION_AWS_EKS_CLUSTER_VERSION,
  ANNOTATION_AWS_IAM_ROLE_ARN,
} from '../annotations';
import {
  AccountConfig,
  AWSEntityProviderConfig,
  DynamicAccountConfig,
} from '../types';
import { duration } from '../utils/timer';

import defaultTemplate from './AWSEKSClusterProvider.default.yaml.njk';
import { AWSEntityProvider } from './AWSEntityProvider';

/**
 * Provides entities from AWS EKS Cluster service.
 */
export class AWSEKSClusterProvider extends AWSEntityProvider<Cluster> {
  private readonly clusterTypeValue: string;

  static fromConfig(
    config: Config,
    options: AWSEntityProviderConfig & {
      clusterTypeValue?: string;
    },
  ) {
    return super.fromConfig(config, options) as AWSEKSClusterProvider;
  }

  constructor(
    account: AccountConfig,
    options: AWSEntityProviderConfig & {
      clusterTypeValue?: string;
    },
  ) {
    super(account, options);
    this.clusterTypeValue = options.clusterTypeValue ?? 'eks-cluster';
  }

  getProviderName(): string {
    return `aws-eks-cluster-${this.providerId ?? 0}`;
  }

  protected getResourceAnnotations(resource: Cluster): Record<string, string> {
    const annotations: Record<string, string> = {};

    if (resource.version) {
      annotations[ANNOTATION_AWS_EKS_CLUSTER_VERSION] = resource.version;
    }

    if (resource.arn) {
      annotations[ANNOTATION_AWS_EKS_CLUSTER_ARN] = resource.arn;
    }

    if (resource.roleArn) {
      annotations[ANNOTATION_AWS_IAM_ROLE_ARN] = resource.roleArn;
    }

    if (resource.endpoint) {
      annotations[ANNOTATION_KUBERNETES_API_SERVER] = resource.endpoint;
    }

    if (resource.certificateAuthority?.data) {
      annotations[ANNOTATION_KUBERNETES_API_SERVER_CA] =
        resource.certificateAuthority.data;
    }

    return annotations;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
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

    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;
    const groups = await this.getGroups();

    this.logger.info(`Providing EKS cluster resources from AWS: ${accountId}`);
    const eksResources: Array<Promise<Entity>> = [];

    const eks = await this.getEks(dynamicAccountConfig);

    const defaultAnnotations = await this.buildDefaultAnnotations(
      dynamicAccountConfig,
    );

    const template = this.template.child({
      groups,
      defaultAnnotations,
      ...parsedConfig,
    });

    const paginatorConfig = {
      client: eks,
      pageSize: 25,
    };

    const clusterPages = paginateListClusters(paginatorConfig, {});

    for await (const clusterPage of clusterPages) {
      for (const name of clusterPage.clusters || []) {
        if (name) {
          const cluster = await eks.describeCluster({ name });

          eksResources.push(
            template.render({
              data: cluster.cluster,
              tags: cluster.cluster?.tags,
              additionalData: {
                clusterName: name,
                clusterTypeValue: this.clusterTypeValue,
              },
            }),
          );
        }
      }
    }

    await this.applyMutation(eksResources);

    this.logger.info(
      `Finished providing ${eksResources.length} EKS cluster resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
