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

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { IAM, paginateListUsers } from '@aws-sdk/client-iam';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_IAM_USER_ARN } from '../annotations';
import { arnToName } from '../utils/arnToName';
import { ARN } from 'link2aws';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

/**
 * Provides entities from AWS IAM User service.
 */
export class AWSIAMUserProvider extends AWSEntityProvider {
  getProviderName(): string {
    return `aws-iam-user-${this.providerId ?? 0}`;
  }

  private async getIam(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new IAM({ credentials, region })
      : new IAM(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const startTimestamp = process.hrtime();

    const { accountId } = this.getParsedConfig(dynamicAccountConfig);
    this.logger.info(`Providing IAM user resources from AWS: ${accountId}`);
    const userResources: Entity[] = [];

    const defaultAnnotations =
      this.buildDefaultAnnotations(dynamicAccountConfig);

    const iam = await this.getIam(dynamicAccountConfig);

    const paginatorConfig = {
      client: iam,
      pageSize: 25,
    };

    const userPages = paginateListUsers(paginatorConfig, {});

    for await (const userPage of userPages) {
      for (const user of userPage.Users || []) {
        if (user.UserName && user.Arn && user.UserId) {
          const consoleLink = new ARN(user.Arn).consoleLink;
          let entity: Entity | undefined = this.renderEntity(
            { data: user },
            { defaultAnnotations: await defaultAnnotations },
          );
          if (!entity) {
            entity = {
              kind: 'User',
              apiVersion: 'backstage.io/v1alpha1',
              metadata: {
                annotations: {
                  ...(await defaultAnnotations),
                  [ANNOTATION_AWS_IAM_USER_ARN]: user.Arn,
                  [ANNOTATION_VIEW_URL]: consoleLink.toString(),
                },
                name: arnToName(user.Arn),
                title: user.UserName,
                labels: this.labelsFromTags(user.Tags),
              },
              spec: {
                profile: {
                  displayName: user.Arn,
                  email: user.UserName,
                },
                memberOf: [],
              },
            };
          }

          userResources.push(entity);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: userResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${userResources.length} IAM user resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
