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

import { CatalogProcessor } from '@backstage/plugin-catalog-backend';
import { CatalogApi } from '@backstage/catalog-client';
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';

export abstract class AWSCatalogProcessor implements CatalogProcessor {
  protected readonly catalogApi: CatalogApi;
  protected readonly logger: Logger | LoggerService;
  public abstract getProcessorName(): string;
  constructor({
    catalogApi,
    logger,
  }: {
    catalogApi: CatalogApi;
    logger: Logger | LoggerService;
  }) {
    this.catalogApi = catalogApi;
    this.logger = logger;
  }
}
