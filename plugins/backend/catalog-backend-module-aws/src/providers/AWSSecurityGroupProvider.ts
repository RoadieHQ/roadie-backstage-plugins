/*
 * Copyright 2023 Larder Software Limited
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

import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { LoggerService } from '@backstage/backend-plugin-api';
import type { Logger } from 'winston';
import { EC2 } from '@aws-sdk/client-ec2';
import { AWSEntityProvider } from './AWSEntityProvider';
import {
  LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
} from '../utils/tags';
import { DynamicAccountConfig } from '../types';
import { ARN } from 'link2aws';
import { duration } from '../utils/timer';
import { DescribeSecurityGroupsCommandOutput } from '@aws-sdk/client-ec2/dist-types/commands/DescribeSecurityGroupsCommand';

const ANNOTATION_SECURITY_GROUP_ID = 'amazonaws.com/security-group-id';

/**
 * Provides entities from AWS Security Groups.
 */
export class AWSSecurityGroupProvider extends AWSEntityProvider {
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

    return new AWSSecurityGroupProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  getProviderName(): string {
    return `aws-security-group-provider-${this.providerId ?? 0}`;
  }

  private async getEc2(dynamicAccountConfig?: DynamicAccountConfig) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new EC2({ credentials, region: region })
      : new EC2(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }
    const startTimestamp = process.hrtime();

    const { region, accountId } = this.getParsedConfig(dynamicAccountConfig);
    const groups = await this.getGroups();

    this.logger.info(
      `Providing security group resources from aws: ${accountId}`,
    );
    const entities: Entity[] = [];

    const ec2 = await this.getEc2(dynamicAccountConfig);
    const defaultAnnotations = await this.buildDefaultAnnotations(
      dynamicAccountConfig,
    );

    let nextToken: string | undefined = undefined;
    let pageCount = 0;

    do {
      const securityGroups: DescribeSecurityGroupsCommandOutput =
        await ec2.describeSecurityGroups({
          NextToken: nextToken,
        });

      pageCount++;

      for (const sg of securityGroups.SecurityGroups || []) {
        const securityGroupId = sg.GroupId;
        if (!securityGroupId) continue;

        const arn = `arn:aws:ec2:${region}:${accountId}:security-group/${securityGroupId}`;
        const consoleLink = new ARN(arn).consoleLink;

        // Format the rules for better readability
        const ingressRules =
          sg.IpPermissions?.map(perm => {
            const protocol = perm.IpProtocol === '-1' ? 'All' : perm.IpProtocol;
            const portRange =
              perm.FromPort === perm.ToPort
                ? perm.FromPort?.toString() || 'All'
                : `${perm.FromPort || 'All'}-${perm.ToPort || 'All'}`;

            const sources = [
              ...(perm.IpRanges?.map(r => r.CidrIp) || []),
              ...(perm.UserIdGroupPairs?.map(g => g.GroupId) || []),
            ].join(', ');

            return `${protocol}:${portRange} from ${sources || 'None'}`;
          }).join('; ') || 'None';

        const egressRules =
          sg.IpPermissionsEgress?.map(perm => {
            const protocol = perm.IpProtocol === '-1' ? 'All' : perm.IpProtocol;
            const portRange =
              perm.FromPort === perm.ToPort
                ? perm.FromPort?.toString() || 'All'
                : `${perm.FromPort || 'All'}-${perm.ToPort || 'All'}`;

            const destinations = [
              ...(perm.IpRanges?.map(r => r.CidrIp) || []),
              ...(perm.UserIdGroupPairs?.map(g => g.GroupId) || []),
            ].join(', ');

            return `${protocol}:${portRange} to ${destinations || 'None'}`;
          }).join('; ') || 'None';

        let entity = this.renderEntity({ securityGroup: sg }, { defaultAnnotations });
        if (!entity) {
          entity = {
            kind: 'Resource',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              annotations: {
                ...defaultAnnotations,
                [ANNOTATION_VIEW_URL]: consoleLink,
                [ANNOTATION_SECURITY_GROUP_ID]: securityGroupId,
              },
              labels: this.labelsFromTags(sg.Tags),
              name: securityGroupId,
              title:
                sg.Tags?.find(tag => tag.Key === 'Name')?.Value ||
                sg.GroupName ||
                securityGroupId,
              description: sg.Description,
              vpcId: sg.VpcId,
              groupName: sg.GroupName,
              ingressRules: ingressRules,
              egressRules: egressRules,
            },
            spec: {
              owner: ownerFromTags(sg.Tags, this.getOwnerTag(), groups),
              ...relationshipsFromTags(sg.Tags),
              type: 'security-group',
            },
          };
        }

        entities.push(entity);
      }

      nextToken = securityGroups.NextToken;
    } while (nextToken);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${entities.length} Security Group resources from AWS: ${accountId} (processed ${pageCount} pages)`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
