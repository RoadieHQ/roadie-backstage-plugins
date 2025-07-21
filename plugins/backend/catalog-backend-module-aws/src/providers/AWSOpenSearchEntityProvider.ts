/*
 * Copyright 2024 Larder Software Limited
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
import { OpenSearch } from '@aws-sdk/client-opensearch';
import type { Logger } from 'winston';
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
import { ANNOTATION_AWS_OPEN_SEARCH_ARN } from '../annotations';

/**
 * Provides entities from AWS OpenSearch service.
 */
export class AWSOpenSearchEntityProvider extends AWSEntityProvider {
  private readonly opensearchTypeValue: string;

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

    return new AWSOpenSearchEntityProvider(
      { accountId, roleName, roleArn, externalId, region },
      options,
    );
  }

  constructor(
    account: AccountConfig,
    options: {
      logger: Logger | LoggerService;
      template?: string;
      catalogApi?: CatalogApi;
      providerId?: string;
      ownerTag?: string;
      useTemporaryCredentials?: boolean;
    },
  ) {
    super(account, options);
    this.opensearchTypeValue = 'opensearch-domain';
  }

  getProviderName(): string {
    return `aws-opensearch-domain-${this.providerId ?? 0}`;
  }

  private async getOpenSearchClient(
    dynamicAccountConfig?: DynamicAccountConfig,
  ) {
    const { region } = this.getParsedConfig(dynamicAccountConfig);
    const credentials = this.useTemporaryCredentials
      ? this.getCredentials(dynamicAccountConfig)
      : await this.getCredentialsProvider();
    return this.useTemporaryCredentials
      ? new OpenSearch({ credentials, region })
      : new OpenSearch(credentials);
  }

  async run(dynamicAccountConfig?: DynamicAccountConfig): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const startTimestamp = process.hrtime();
    const { accountId } = this.getParsedConfig(dynamicAccountConfig);

    this.logger.info(
      `Providing OpenSearch domain resources from AWS: ${accountId}`,
    );
    const opensearchEntities: Entity[] = [];

    const openSearchClient = await this.getOpenSearchClient(
      dynamicAccountConfig,
    );

    const defaultAnnotations = await this.buildDefaultAnnotations(
      dynamicAccountConfig,
    );

    // Fetch all OpenSearch domains
    const domainList = await openSearchClient.listDomainNames();

    if (domainList.DomainNames) {
      for (const {
        DomainName: domainName = 'unknown',
      } of domainList.DomainNames) {
        const domain = await openSearchClient.describeDomain({
          DomainName: domainName,
        });
        const domainStatus = domain.DomainStatus;
        const domainArn = domainStatus?.ARN;
        const tags = domainArn
          ? await openSearchClient.listTags({ ARN: domainArn })
          : undefined;

        const endpoint = domainStatus?.Endpoint || '';
        const engineVersion = domainStatus?.EngineVersion || '';
        const storageType = domainStatus?.EBSOptions?.EBSEnabled
          ? `EBS-${domainStatus.EBSOptions.VolumeType}`
          : 'Instance Storage';

        let entity = this.renderEntity({ domain }, { defaultAnnotations });
        if (!entity) {
          entity = {
            kind: 'Resource',
            apiVersion: 'backstage.io/v1beta1',
            metadata: {
              name: domainName.toLowerCase().replace(/[^a-zA-Z0-9\-]/g, '-'),
              title: domainName,
              annotations: {
                ...defaultAnnotations,
                [ANNOTATION_AWS_OPEN_SEARCH_ARN]: domainArn ?? '',
              },
              labels: {
                'aws-opensearch-region': this.region,
              },
              endpoint,
              engineVersion,
              storageType,
            },
            spec: {
              owner: ownerFromTags(tags?.TagList || [], this.getOwnerTag()),
              ...relationshipsFromTags(tags?.TagList || []),
              type: this.opensearchTypeValue,
            },
          };
        }

        opensearchEntities.push(entity);
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: opensearchEntities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });

    this.logger.info(
      `Finished providing ${opensearchEntities.length} OpenSearch domain resources from AWS: ${accountId}`,
      { run_duration: duration(startTimestamp) },
    );
  }
}
