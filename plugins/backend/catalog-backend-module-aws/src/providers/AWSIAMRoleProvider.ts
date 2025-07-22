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
import { IAM, paginateListRoles } from '@aws-sdk/client-iam';
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_IAM_ROLE_ARN } from '../annotations';
import { arnToName } from '../utils/arnToName';
import { ARN } from 'link2aws';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { CatalogApi } from '@backstage/catalog-client';
import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

/**
 * Provides entities from AWS IAM Role service.
 */
export class AWSIAMRoleProvider extends AWSEntityProvider {
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
    },
  ) {
    const accountId = config.getString('accountId');
    const roleName = config.getString('roleName');
    const roleArn = config.getOptionalString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSIAMRoleProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-iam-role-${this.providerId ?? 0}`;
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

    const groups = await this.getGroups();

    this.logger.info(`Providing IAM role resources from AWS: ${accountId}`);
    const roleResources: Entity[] = [];

    const defaultAnnotations =
      this.buildDefaultAnnotations(dynamicAccountConfig);

    const iam = await this.getIam(dynamicAccountConfig);

    const paginatorConfig = {
      client: iam,
      pageSize: 25,
    };

    const rolePages = paginateListRoles(paginatorConfig, {});

    for await (const rolePage of rolePages) {
      for (const role of rolePage.Roles || []) {
        if (role.RoleName && role.Arn && role.RoleId) {
          const consoleLink = new ARN(role.Arn).consoleLink;
          let entity: Entity | undefined = this.renderEntity(
            { data: role },
            { defaultAnnotations: await defaultAnnotations },
          );
          if (!entity) {
            entity = {
              kind: 'Resource',
              apiVersion: 'backstage.io/v1alpha1',
              metadata: {
                annotations: {
                  ...(await defaultAnnotations),
                  [ANNOTATION_AWS_IAM_ROLE_ARN]: role.Arn,
                  [ANNOTATION_VIEW_URL]: consoleLink.toString(),
                },
                name: arnToName(role.Arn),
                title: role.RoleName,
                labels: this.labelsFromTags(role.Tags),
              },
              spec: {
                type: 'aws-role',
                owner: ownerFromTags(role.Tags, this.getOwnerTag(), groups),
                ...relationshipsFromTags(role.Tags),
              },
            };
          }

          roleResources.push(entity);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: roleResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${roleResources.length} IAM role resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
