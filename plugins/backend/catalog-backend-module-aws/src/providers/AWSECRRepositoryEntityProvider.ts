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

import {
  ECRClient,
  ListTagsForResourceCommand,
  paginateDescribeRepositories,
  Repository,
} from '@aws-sdk/client-ecr';
import { Entity } from '@backstage/catalog-model';

import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

import defaultTemplate from './AWSECRRepositoryEntityProvider.default.yaml.njk';
import { AWSEntityProvider } from './AWSEntityProvider';

const ANNOTATION_AWS_ECR_REPO_ARN = 'amazonaws.com/ecr-repository-arn';

/**
 * Provides entities from AWS ECR service.
 */
export class AWSECRRepositoryEntityProvider extends AWSEntityProvider<Repository> {
  getProviderName(): string {
    return `aws-ecr-repo-${this.providerId ?? 0}`;
  }

  protected getResourceAnnotations(
    resource: Repository,
  ): Record<string, string> {
    const repositoryArn = resource.repositoryArn ?? '';

    return {
      [ANNOTATION_AWS_ECR_REPO_ARN]: repositoryArn,
    };
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
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

    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(
      `Providing ECR repository resources from AWS: ${accountId}`,
    );
    const ecrResources: Array<Promise<Entity>> = [];

    const ecr = await this.getECRClient(dynamicAccountConfig);
    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    const paginator = paginateDescribeRepositories({ client: ecr }, {});
    for await (const page of paginator) {
      for (const repo of page.repositories ?? []) {
        if (!repo.repositoryName) continue;

        const tagsResponse = await ecr.send(
          new ListTagsForResourceCommand({
            resourceArn: repo.repositoryArn!,
          }),
        );

        const tags = (tagsResponse.tags ?? []).reduce((acc, tag) => {
          if (tag.Key && tag.Value) acc[tag.Key] = tag.Value;
          return acc;
        }, {} as Record<string, string>);

        ecrResources.push(
          template.render({
            data: repo,
            tags,
          }),
        );
      }
    }

    await this.applyMutation(ecrResources);

    this.logger.info(
      `Finished providing ${ecrResources.length} ECR repository resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
