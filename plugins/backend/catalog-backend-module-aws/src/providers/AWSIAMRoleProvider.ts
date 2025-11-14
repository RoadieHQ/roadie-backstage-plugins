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

import { readFileSync } from 'fs';

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { IAM, paginateListRoles, Role } from '@aws-sdk/client-iam';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_IAM_ROLE_ARN } from '../annotations';
import { ARN } from 'link2aws';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

const defaultTemplate = readFileSync(
  require.resolve('./AWSIAMRoleProvider.default.yaml.njs'),
  'utf-8',
);

/**
 * Provides entities from AWS IAM Role service.
 */
export class AWSIAMRoleProvider extends AWSEntityProvider<Role> {
  getProviderName(): string {
    return `aws-iam-role-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(resource: Role): Record<string, string> {
    const consoleLink = new ARN(resource.Arn!).consoleLink;
    return {
      [ANNOTATION_AWS_IAM_ROLE_ARN]: resource.Arn!,
      [ANNOTATION_VIEW_URL]: consoleLink.toString(),
    };
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
    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(`Providing IAM role resources from AWS: ${accountId}`);

    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    const iam = await this.getIam(dynamicAccountConfig);

    const paginatorConfig = {
      client: iam,
      pageSize: 25,
    };

    const rolePages = paginateListRoles(paginatorConfig, {});

    const resources: Array<Promise<Entity>> = [];
    for await (const rolePage of rolePages) {
      for (const role of rolePage.Roles || []) {
        if (role.RoleName && role.Arn && role.RoleId) {
          resources.push(template.render({ data: role, tags: role.Tags }));
        }
      }
    }

    const entities = await Promise.all(resources);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${entities.length} IAM role resources from AWS: ${accountId}`,
      {
        run_duration: duration(startTimestamp),
      },
    );
  }
}
