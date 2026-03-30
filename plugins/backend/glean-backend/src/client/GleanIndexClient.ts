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
import { Entity } from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { startCase } from 'lodash';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';
import { v4 as uuidv4 } from 'uuid';
import {
  AuthService,
  DiscoveryService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { TechDocsClient } from './TechDocsClient';
import { GleanDocument } from './types';
import { CatalogApi } from '@backstage/catalog-client';
import crypto from 'crypto';

export class GleanIndexClient {
  private techDocsClient: TechDocsClient;

  static create({
    auth,
    config,
    discoveryApi,
    catalogApi,
    logger,
  }: {
    auth: AuthService;
    config: Config;
    discoveryApi: DiscoveryService;
    catalogApi: CatalogApi;
    logger: LoggerService;
  }) {
    return new GleanIndexClient(config, logger, discoveryApi, catalogApi, auth);
  }

  constructor(
    private readonly config: Config,
    private logger: LoggerService,
    discoveryApi: DiscoveryService,
    catalogApi: CatalogApi,
    auth: AuthService,
  ) {
    this.techDocsClient = TechDocsClient.create({
      auth,
      config,
      discoveryApi,
      catalogApi,
      logger,
    });
  }

  private generateUploadId(): string {
    return `upload-${uuidv4()}`;
  }

  private parseMainContent(rawHtml: string): string {
    const root = parse(rawHtml);
    root.querySelectorAll('nav').forEach(nav => nav.remove());
    return root.toString();
  }

  async buildDocument(
    entity: Entity,
    filePath: string,
  ): Promise<GleanDocument> {
    const rawHtml = await this.techDocsClient
      .getTechDocsStaticFile(entity, filePath)
      .catch(e => {
        this.logger.warn(
          `fetching static file ${filePath} for ${this.techDocsClient.getEntityUri(
            entity,
          )}: ${e.message}`,
        );
        return null;
      });

    // Shorten the document id by hashing the filePath so 200 characters limit isn't exceeded
    const filePathHash = crypto
      .createHash('sha256')
      .update(filePath)
      .digest('hex')
      .slice(0, 12);

    const document: GleanDocument = {
      container: this.techDocsClient.getEntityUri(entity),
      datasource: this.config.getString('glean.datasource'),
      id: `${this.techDocsClient.getEntityUri(entity)}/${filePathHash}`,
      permissions: { allowAnonymousAccess: true },
      title:
        this.techDocsClient.parseTitle(rawHtml ?? '') ?? startCase(filePath),
      updatedAt: Math.floor(
        this.techDocsClient.parseUpdatedAt(rawHtml ?? '').getTime() / 1000,
      ),
      viewURL: this.techDocsClient.getViewUrl(entity, filePath),
      body: {
        mimeType: 'text/html',
        textContent: this.parseMainContent(rawHtml ?? ''),
      },
    };

    this.logger.debug(`Building document: ${JSON.stringify(document)}`);
    return document;
  }

  private async buildDocuments(entity: Entity, filesToBuild: Array<string>) {
    return Promise.all(
      filesToBuild.map((filePath: string) =>
        this.buildDocument(entity, filePath),
      ),
    );
  }

  async indexDocuments(
    documents: (GleanDocument | null)[],
    isFirstPage: boolean,
    isLastPage: boolean,
    uploadId: string,
  ): Promise<string> {
    const apiIndexUrl = this.config.getString('glean.apiIndexUrl');
    const response = await fetch(apiIndexUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.getString('glean.token')}`,
      },
      body: JSON.stringify({
        uploadId,
        isFirstPage,
        isLastPage,
        forceRestartUpload: isFirstPage,
        datasource: this.config.getString('glean.datasource'),
        documents,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `POST ${apiIndexUrl} status: ${response.status}, body: ${body}`,
      );
    }
    return response.statusText;
  }

  async batchIndexDocuments(
    uploadId: string,
    documents: (GleanDocument | null)[],
  ) {
    let batchCount = 0;
    const batchSize = 25;
    const errors: Error[] = [];

    for (
      let index = 0;
      index < (documents?.length ?? 0);
      index = index + batchSize
    ) {
      const isFirstPage = index < batchSize;
      const isLastPage = documents
        ? index >= documents.length - batchSize
        : false;
      const batch = documents.slice(index, index + batchSize);
      const response = await this.indexDocuments(
        batch,
        isFirstPage,
        isLastPage,
        uploadId,
      ).catch(e => {
        errors.push(e);
      });
      this.logger.debug(
        `${uploadId} indexing batch ${batchCount}: ${response}`,
      );
      batchCount++;
    }
    if (errors.length > 0) {
      this.logger.error(`${uploadId} indexing batch ${batchCount}: ${errors}`);
      return null;
    }
    this.logger.info(
      `${uploadId} successfully batch indexed ${documents.length} documents in ${batchCount} batches`,
    );
    return batchCount;
  }

  async batchIndexTechDocs(entities: Entity[]) {
    const uploadId = this.generateUploadId();
    this.logger.info(
      `${uploadId} batch indexing entities: ${entities
        .map(e => this.techDocsClient.getEntityUri(e))
        .join(', ')}`,
    );

    const documents = await Promise.all(
      entities.map(async entity => {
        const metadata = await this.techDocsClient
          .getTechDocsMetadata(entity)
          .catch(e => {
            this.logger.warn(
              `fetching metadata for ${this.techDocsClient.getEntityUri(
                entity,
              )}: ${e.message}`,
            );
            return null;
          });
        const filesToIndex = metadata?.files?.filter(
          (filePath: string) =>
            filePath.endsWith('.html') && filePath !== '404.html',
        );
        // the entity has the techdocs-ref annotation but no files to index
        if (!filesToIndex || filesToIndex.length === 0) {
          this.logger.warn(
            `No files to index for ${this.techDocsClient.getEntityUri(entity)}`,
          );
          return null;
        }
        return this.buildDocuments(entity, filesToIndex);
      }),
    );
    if (!documents || documents.length === 0) {
      this.logger.error(
        `${uploadId}: no documents to index for
      ${entities
        .map(e => this.techDocsClient.getEntityUri(e))
        .join(', ')}, skipping bulk indexing`,
      );
      return { uploadId, batchCount: 0 };
    }

    const documentsToIndex = documents
      .flat()
      .filter(document => document !== null && document !== undefined);
    const batchCount = await this.batchIndexDocuments(
      uploadId,
      documentsToIndex,
    ).catch(e => {
      this.logger.error(`batch indexing ${uploadId}: ${e.message}`);
      return { uploadId, batchCount: 0 };
    });
    return { uploadId, batchCount };
  }

  async batchIndex(entities: Entity[]) {
    // extend this method as there are more types of entities to index
    return await this.batchIndexTechDocs(entities);
  }
}
