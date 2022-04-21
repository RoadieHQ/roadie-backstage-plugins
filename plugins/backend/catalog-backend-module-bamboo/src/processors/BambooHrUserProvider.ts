/*
 * Copyright 2021 The Backstage Authors
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
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-backend';
import {processUsers, UserObject} from '../bamboo';
import { Logger } from 'winston';
import axios from 'axios';
import { UserEntity } from '@backstage/catalog-model';

type ProviderConfig = {
  apiKey: string;
  domain: string;
};

type BambooDirectoryResp = {
  fields: {
    [key: string]: any;
  };
  employees: UserObject[];
};

export function readConfig(config: Config, logger: Logger): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  const providerConfigs =
    config.getOptionalConfigArray('integrations.bamboohr.providers') ??
    [];
  for (const providerConfig of providerConfigs) {
    try {
      const apiKey = providerConfig.getString('apiKey').split('\\n').join('\n');
      const domain = providerConfig.getString('domain');

      providers.push({ apiKey, domain });
    } catch (e) {
      logger.info(`Failed to configure bamboohr-org provider: ${e}`);
    }
  }
  return providers;
}

export class BambooHrUserProvider implements EntityProvider {
  private readonly logger: Logger;
  private readonly providers: ProviderConfig[];
  private connection?: EntityProviderConnection;

  static fromConfig(config: Config, options: { logger: Logger }) {
    const providers: ProviderConfig[] = readConfig(config, options.logger);

    return new BambooHrUserProvider({
      ...options,
      providers,
    });
  }

  constructor({logger, providers}:{logger:Logger;providers: ProviderConfig[]}) {
    this.logger = logger;
    this.providers = providers;
  }

  getProviderName(): string {
    return `bamboohr-user-provider`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  async run(): Promise<void> {
    this.logger.info(`Running ${this.getProviderName()} provider loop`);
    await this.providers.map(async ({apiKey, domain}) => {
      if (!this.connection) {
        throw new Error('Not initialized');
      }
      const annotation = `${this.getProviderName()}:${domain}`
      const defaultAnnotations: { [name: string]: string } = {
        [ANNOTATION_LOCATION]: annotation,
        [ANNOTATION_ORIGIN_LOCATION]: annotation
      };
      try {
        const resp: BambooDirectoryResp = (
          await axios.get(
            `https://api.bamboohr.com/api/gateway.php/${domain}/v1/employees/directory`,
            { 
              headers: {
                Accept: 'application/json',
                Authorization: `Basic ${apiKey}`
              } 
            },
          )
        ).data;
        const entityUsers: UserEntity[] = processUsers(resp.employees, defaultAnnotations);
        this.logger.info(`Creating ${entityUsers.length} users.`);
        await this.connection.applyMutation({
          type: 'full',
          //@ts-ignore
          entities: entityUsers.map((entity: UserEntity) => {
            this.logger.info(`Creating ${entity.metadata.name} user with location key ${annotation}`);
            return {
              entity,
              locationKey: annotation
            }
          }),
        });
      } catch(e:any){
        this.logger.error(`Could not create entities for provider ${this.getProviderName()}. Got error: ${e.message}`);
        throw new Error(`Provider error: ${e.message}`);
      }
    });
  }
}
