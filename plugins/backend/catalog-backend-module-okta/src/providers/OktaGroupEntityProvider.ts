/*
 * Copyright 2022 Larder Software Limited
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

import { GroupEntity } from '@backstage/catalog-model';
import * as winston from 'winston';
import { Config } from '@backstage/config';
import { OktaEntityProvider } from './OktaEntityProvider';
import {
  GroupNamingStrategies,
  GroupNamingStrategy,
  groupNamingStrategyFactory,
} from './groupNamingStrategyFactory';
import {
  UserNamingStrategies,
  UserNamingStrategy,
  userNamingStrategyFactory,
} from './userNamingStrategyFactory';
import { AccountConfig } from '../types';
import { groupEntityFromOktaGroup } from './groupEntityFromOktaGroup';

/**
 * Provides entities from Okta Group service.
 */
export class OktaGroupEntityProvider extends OktaEntityProvider {
  private readonly namingStrategy: GroupNamingStrategy;
  private readonly userNamingStrategy: UserNamingStrategy;
  private readonly groupFilter: string | undefined;
  private orgUrl: string;

  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      namingStrategy?: GroupNamingStrategies;
      userNamingStrategy?: UserNamingStrategies;
    },
  ) {
    const orgUrl = config.getString('orgUrl');
    const token = config.getString('token');

    const groupFilter = config.getOptionalString('groupFilter');

    return new OktaGroupEntityProvider({ orgUrl, token, groupFilter }, options);
  }

  constructor(
    accountConfig: AccountConfig,
    options: {
      logger: winston.Logger;
      namingStrategy?: GroupNamingStrategies;
      userNamingStrategy?: UserNamingStrategies;
    },
  ) {
    super([accountConfig], options);
    this.namingStrategy = groupNamingStrategyFactory(options.namingStrategy);
    this.userNamingStrategy = userNamingStrategyFactory(
      options.userNamingStrategy,
    );
    this.orgUrl = accountConfig.orgUrl;
    this.groupFilter = accountConfig.groupFilter;
  }

  getProviderName(): string {
    return `okta-group-${this.orgUrl}`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(`Providing group resources from okta: ${this.orgUrl}`);
    const groupResources: GroupEntity[] = [];

    const client = this.getClient(this.orgUrl);

    const defaultAnnotations = await this.buildDefaultAnnotations();

    await client.listGroups({ search: this.groupFilter }).each(async group => {
      const members: string[] = [];
      await group.listUsers().each(user => {
        members.push(this.userNamingStrategy(user));
      });

      const groupEntity = groupEntityFromOktaGroup(group, this.namingStrategy, {
        annotations: defaultAnnotations,
        members,
      });

      groupResources.push(groupEntity);
    });

    await this.connection.applyMutation({
      type: 'full',
      entities: groupResources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });
    this.logger.info(
      `Finished providing ${groupResources.length} group resources from okta: ${this.orgUrl}`,
    );
  }
}
