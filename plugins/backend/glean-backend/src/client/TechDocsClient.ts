/*
 * Copyright 2025 Larder Software Limited
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
import { DEFAULT_NAMESPACE, Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { TechDocsMetadata } from '@backstage/plugin-techdocs-node';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import {
  CATALOG_FILTER_EXISTS,
  CatalogApi,
  GetEntitiesResponse,
} from '@backstage/catalog-client';

import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import https from 'https';
import { EntityUri } from './types';

export class TechDocsClient {
  private agent = new https.Agent({ keepAlive: false });

  static create({
    config,
    discoveryApi,
    logger,
    auth,
    catalogApi,
  }: {
    config: Config;
    discoveryApi: DiscoveryService;
    catalogApi: CatalogApi;
    logger: LoggerService;
    auth: AuthService;
  }) {
    return new TechDocsClient(config, discoveryApi, logger, auth, catalogApi);
  }

  constructor(
    private readonly config: Config,
    private readonly discoveryApi: DiscoveryService,
    private logger: LoggerService,
    private readonly auth: AuthService,
    private readonly catalogApi: CatalogApi,
  ) {}

  async getTechDocsMetadataUrl(path: string = '') {
    return `${await this.discoveryApi.getBaseUrl(
      'techdocs',
    )}/metadata/techdocs/${path}`;
  }

  async getTechDocsStaticUrl(path: string = '') {
    return `${await this.discoveryApi.getBaseUrl(
      'techdocs',
    )}/static/docs/${path}`;
  }

  getEntityUri(entity: Entity): EntityUri {
    return `${entity.metadata.namespace ?? DEFAULT_NAMESPACE}/${entity.kind}/${
      entity.metadata.name
    }`.toLowerCase() as EntityUri;
  }

  getViewUrl(entity: Entity, filePath: string) {
    const docsUrl = `${this.config.getString('app.baseUrl')}/docs`;
    const entityUrl = `${docsUrl}/${this.getEntityUri(entity)}`;
    return `${entityUrl}/${filePath.replace(/\/index\.html|\.html/, '')}`;
  }

  async getTechDocsEntities(): Promise<Entity[]> {
    const entities = await this.getTechDocsEntitiesResponse();
    return entities?.items;
  }

  async getTechDocsEntitiesResponse(): Promise<GetEntitiesResponse> {
    const res = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'catalog',
    });

    const { token } = res;
    const entities = await this.catalogApi.getEntities(
      {
        filter: {
          'metadata.annotations.backstage.io/techdocs-ref':
            CATALOG_FILTER_EXISTS,
        },
      },
      {
        token,
      },
    );
    return entities;
  }

  async getTechDocsMetadata(entity: Entity): Promise<TechDocsMetadata> {
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'techdocs',
    });

    const url = await this.getTechDocsMetadataUrl(this.getEntityUri(entity));
    this.logger.debug(`getTechDocsMetadata fetch URL ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      ...this.agent,
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  }

  async getTechDocsStaticFile(entity: Entity, filePath: string) {
    const { token } = await this.auth.getPluginRequestToken({
      onBehalfOf: await this.auth.getOwnServiceCredentials(),
      targetPluginId: 'techdocs',
    });

    const url = await this.getTechDocsStaticUrl(
      `${this.getEntityUri(entity)}/${filePath}`,
    );
    this.logger.debug(`getTechDocsStaticFile fetch URL ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
        Authorization: `Bearer ${token}`,
      },
      ...this.agent,
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.text();
  }

  parseUpdatedAt(rawHtml: string): Date {
    const root = parse(rawHtml);
    const updatedAtDateString = root.querySelector(
      '.git-revision-date-localized-plugin.git-revision-date-localized-plugin-date',
    )?.rawText;
    return updatedAtDateString ? new Date(updatedAtDateString) : new Date();
  }

  parseTitle(rawHtml: string): string | undefined {
    const root = parse(rawHtml);
    const h1 = root.querySelector('h1');
    return h1?.rawText
      .replaceAll('&amp;', '&')
      .replaceAll('&para;', '')
      .replaceAll('#', '')
      .replaceAll('"', '')
      .trim();
  }
}
