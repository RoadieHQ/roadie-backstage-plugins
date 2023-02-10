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

import { ANNOTATION_VIEW_URL, ResourceEntity } from '@backstage/catalog-model';
import { IAM, paginateListRoles } from '@aws-sdk/client-iam';
import * as winston from 'winston';
import { Config } from '@backstage/config';
import { AWSEntityProvider } from './AWSEntityProvider';
import { ANNOTATION_AWS_IAM_ROLE_ARN } from '../annotations';
import { arnToName } from '../utils/arnToName';
import { ARN } from 'link2aws';

/**
 * Provides entities from AWS IAM Role service.
 */
export class AWSIAMRoleProvider extends AWSEntityProvider {
  static fromConfig(config: Config, options: { logger: winston.Logger }) {
    const accountId = config.getString('accountId');
    const roleArn = config.getString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSIAMRoleProvider(
      { accountId, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-iam-role-${this.accountId}`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(
      `Providing iam role resources from aws: ${this.accountId}`,
    );
    const roleResources: ResourceEntity[] = [];

    const credentials = this.getCredentials();

    const defaultAnnotations = this.buildDefaultAnnotations();

    const iam = new IAM({ credentials, region: this.region });

    const paginatorConfig = {
      client: iam,
      pageSize: 25,
    };

    const rolePages = paginateListRoles(paginatorConfig, {});

    for await (const rolePage of rolePages) {
      for (const role of rolePage.Roles || []) {
        if (role.RoleName && role.Arn && role.RoleId) {
          const consoleLink = new ARN(role.Arn).consoleLink;
          const roleEntity: ResourceEntity = {
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
            },
            spec: {
              type: 'aws-role',
              owner: 'unknown',
            },
          };

          roleResources.push(roleEntity);
        }
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: roleResources.map(entity => ({
        entity,
        locationKey: `aws-iam-role-provider:${this.accountId}`,
      })),
    });
  }
}
