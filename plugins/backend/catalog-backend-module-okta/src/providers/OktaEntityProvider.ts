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

import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-backend';
import { Logger } from 'winston';
import { AccountConfig } from '../types';
import { Client } from '@okta/okta-sdk-nodejs';

import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
} from '@backstage/catalog-model';

export abstract class OktaEntityProvider implements EntityProvider {
  protected readonly orgUrl: string;
  protected readonly token: string;
  protected readonly logger: Logger;
  protected connection?: EntityProviderConnection;

  public abstract getProviderName(): string;

  protected constructor(account: AccountConfig, options: { logger: Logger }) {
    this.orgUrl = account.orgUrl;
    this.token = account.token;
    this.logger = options.logger;
  }

  protected getClient(): Client {
    return new Client({
      orgUrl: this.orgUrl,
      token: this.token,
    });
  }

  public async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  protected async buildDefaultAnnotations() {
    return {
      [ANNOTATION_LOCATION]: this.getProviderName(),
      [ANNOTATION_ORIGIN_LOCATION]: this.getProviderName(),
    };
  }
}
