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

import { EC2, IpPermission, SecurityGroup } from '@aws-sdk/client-ec2';
import { DescribeSecurityGroupsCommandOutput } from '@aws-sdk/client-ec2/dist-types/commands/DescribeSecurityGroupsCommand';
import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { ARN } from 'link2aws';
import { Environment } from 'nunjucks';

import { DynamicAccountConfig } from '../types';
import { duration } from '../utils/timer';

import { AWSEntityProvider } from './AWSEntityProvider';
import defaultTemplate from './AWSSecurityGroupProvider.default.yaml.njk';

const ANNOTATION_SECURITY_GROUP_ID = 'amazonaws.com/security-group-id';

/**
 * Provides entities from AWS Security Groups.
 */
export class AWSSecurityGroupProvider extends AWSEntityProvider<SecurityGroup> {
  protected addCustomFilters(env: Environment): void {
    env.addFilter('format_ingress_rules', (permissions: IpPermission[]) => {
      if (!permissions || permissions.length === 0) {
        return 'None';
      }

      return permissions
        .map(perm => {
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
        })
        .join('; ');
    });

    env.addFilter('format_egress_rules', (permissions: IpPermission[]) => {
      if (!permissions || permissions.length === 0) {
        return 'None';
      }

      return permissions
        .map(perm => {
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
        })
        .join('; ');
    });
  }

  getProviderName(): string {
    return `aws-security-group-provider-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(
    resource: SecurityGroup,
    context: { region: string; accountId: string },
  ): Record<string, string> {
    const { region, accountId } = context;
    const securityGroupId = resource.GroupId;
    const arn = `arn:aws:ec2:${region}:${accountId}:security-group/${securityGroupId}`;
    const consoleLink = new ARN(arn).consoleLink;
    return {
      [ANNOTATION_VIEW_URL]: consoleLink.toString(),
      [ANNOTATION_SECURITY_GROUP_ID]: securityGroupId!,
    };
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

    const parsedConfig = this.getParsedConfig(dynamicAccountConfig);
    const { accountId } = parsedConfig;

    this.logger.info(
      `Providing security group resources from aws: ${accountId}`,
    );
    const sgResources: Array<Promise<Entity>> = [];

    const ec2 = await this.getEc2(dynamicAccountConfig);

    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    let nextToken: string | undefined = undefined;
    let pageCount = 0;

    do {
      const securityGroups: DescribeSecurityGroupsCommandOutput =
        await ec2.describeSecurityGroups({
          NextToken: nextToken,
        });

      if (!securityGroups) {
        break;
      }

      pageCount++;

      for (const sg of securityGroups.SecurityGroups || []) {
        const securityGroupId = sg.GroupId;
        if (!securityGroupId) continue;

        const tags = sg.Tags ?? [];

        sgResources.push(
          template.render({
            data: sg,
            tags,
          }),
        );
      }

      nextToken = securityGroups.NextToken;
    } while (nextToken);

    await this.applyMutation(sgResources);

    this.logger.info(
      `Finished providing ${sgResources.length} Security Group resources from AWS: ${accountId} (processed ${pageCount} pages)`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
