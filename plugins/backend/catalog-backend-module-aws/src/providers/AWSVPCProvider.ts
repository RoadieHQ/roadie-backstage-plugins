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

import { readFileSync } from 'fs';

import { ANNOTATION_VIEW_URL, Entity } from '@backstage/catalog-model';
import { DhcpOptions, EC2, Vpc } from '@aws-sdk/client-ec2';
import { AWSEntityProvider } from './AWSEntityProvider';
import { DynamicAccountConfig } from '../types';
import { ARN } from 'link2aws';
import { duration } from '../utils/timer';
import { Environment } from 'nunjucks';

const ANNOTATION_VPC_ID = 'amazonaws.com/vpc-id';

const defaultTemplate = readFileSync(
  require.resolve('./AWSVPCProvider.default.yaml.njs'),
  'utf-8',
);

/**
 * Provides entities from AWS Virtual Private Clouds.
 */
export class AWSVPCProvider extends AWSEntityProvider<Vpc> {
  protected addCustomFilters(env: Environment): void {
    env.addFilter(
      'get_dhcp_options',
      (vpc: Vpc, { dhcpOption }: { dhcpOption?: DhcpOptions }) => {
        if (!dhcpOption || !dhcpOption.DhcpConfigurations) {
          return vpc.DhcpOptionsId ?? 'None';
        }

        const formatted = dhcpOption.DhcpConfigurations.map(
          config =>
            `${config.Key}: ${config.Values?.map(v => v.Value).join(', ')}`,
        ).join('; ');

        return formatted || 'None';
      },
    );
  }

  getProviderName(): string {
    return `aws-vpc-provider-${this.providerId ?? 0}`;
  }

  protected getDefaultTemplate(): string {
    return defaultTemplate;
  }

  protected getResourceAnnotations(
    resource: Vpc,
    context: { region: string; accountId: string },
  ): Record<string, string> {
    const { region, accountId } = context;
    const vpcId = resource.VpcId;
    const arn = `arn:aws:ec2:${region}:${accountId}:vpc/${vpcId}`;
    const consoleLink = new ARN(arn).consoleLink;
    return {
      [ANNOTATION_VIEW_URL]: consoleLink.toString(),
      [ANNOTATION_VPC_ID]: vpcId!,
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

    this.logger.info(`Providing VPC resources from aws: ${accountId}`);
    const vpcResources: Array<Promise<Entity>> = [];

    const ec2 = await this.getEc2(dynamicAccountConfig);

    const template = this.template.child({
      groups: await this.getGroups(),
      defaultAnnotations: await this.buildDefaultAnnotations(
        dynamicAccountConfig,
      ),
      ...parsedConfig,
    });

    const vpcs = await ec2.describeVpcs({});

    for (const vpc of vpcs.Vpcs || []) {
      const vpcId = vpc.VpcId;
      if (!vpcId) continue;

      const tags = vpc.Tags ?? [];

      // Get DHCP options if available
      let dhcpOption = null;
      if (vpc.DhcpOptionsId) {
        try {
          const dhcpOptions = await ec2.describeDhcpOptions({
            DhcpOptionsIds: [vpc.DhcpOptionsId],
          });
          dhcpOption = dhcpOptions.DhcpOptions?.[0] || null;
        } catch (error) {
          // If fetch fails, dhcpOption remains null
        }
      }

      vpcResources.push(
        template.render({
          data: vpc,
          tags,
          additionalData: { dhcpOption },
        }),
      );
    }

    const entities = await Promise.all(vpcResources);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${entities.length} VPC resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
