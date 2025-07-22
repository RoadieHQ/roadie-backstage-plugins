/*
 * Copyright 2025 Larder Software Limited
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
import {
  ECRClient,
  ListTagsForResourceCommand,
  paginateDescribeRepositories,
} from '@aws-sdk/client-ecr';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { AccountConfig, DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

const ANNOTATION_AWS_ECR_REPO_ARN = 'amazonaws.com/ecr-repository-arn';

/**
 * Provides entities from AWS ECR service.
 */
export class AWSECRRepositoryEntityProvider extends AWSEntityProvider {
  private readonly repoTypeValue: string;

  static fromConfig(
    config: Config,
    options: {
      logger: LoggerService;
      template?: string;
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

    return new AWSECRRepositoryEntityProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  constructor(
    account: AccountConfig,
    options: {
      logger: LoggerService;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      useTemporaryCredentials?: boolean;
      labelValueMapper?: LabelValueMapper;
    },
  ) {
    super(account, options);
    this.repoTypeValue = 'ecr-repository';
  }

  getProviderName(): string {
    return `aws-ecr-repo-${this.providerId ?? 0}`;
  }

  private async getECRClient(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();

    return this.useTemporaryCredentials
      ? new ECRClient({ credentials, region })
      : new ECRClient({ region, ...credentials });
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const startTimestamp = process.hrtime();
    const { accountId } = this.getParsedConfig(dynamicAccountConfig);

    this.logger.info(
      `Providing ECR repository resources from AWS: ${accountId}`,
    );
    const ecrResources: Entity[] = [];

    const ecr = await this.getECRClient(dynamicAccountConfig);
    const defaultAnnotations = await this.buildDefaultAnnotations(
      dynamicAccountConfig,
    );

    const paginator = paginateDescribeRepositories({ client: ecr }, {});
    for await (const page of paginator) {
      for (const repo of page.repositories ?? []) {
        const repositoryName = repo.repositoryName ?? 'unknown';
        const repositoryArn = repo.repositoryArn ?? '';

        const tagsResponse = await ecr.send(
          new ListTagsForResourceCommand({
            resourceArn: repo.repositoryArn!,
          }),
        );

        const tags = (tagsResponse.tags ?? []).reduce((acc, tag) => {
          if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
          return acc;
        }, {} as Record<string, string>);

        let entity: Entity | undefined = this.renderEntity(
          {
            data: repo,
            tags,
          },
          { defaultAnnotations },
        );
        if (!entity) {
          entity = {
            kind: 'Resource',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              name: repositoryName
                .toLowerCase()
                .replace(/[^a-zA-Z0-9\-]/g, '-'),
              title: repositoryName,
              labels: {
                'aws-ecr-region': this.region,
                ...tags,
              },
              annotations: {
                ...defaultAnnotations,
                [ANNOTATION_AWS_ECR_REPO_ARN]: repositoryArn,
              },
              uri: repo.repositoryUri ?? '',
              tagImmutability: repo.imageTagMutability,
              createdAt: repo.createdAt?.toDateString(),
              encryption: repo.encryptionConfiguration?.encryptionType ?? '',
            },
            spec: {
              owner: ownerFromTags(tags, this.getOwnerTag()),
              ...relationshipsFromTags(tags),
              type: this.repoTypeValue,
            },
          };
        }

        ecrResources.push(entity);
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: ecrResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${ecrResources.length} ECR repository resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
