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
import { mockServices } from '@backstage/backend-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { Entity } from '@backstage/catalog-model';
import { ConfigReader } from '@backstage/config';
import { TechDocsMetadata } from '@backstage/plugin-techdocs-node';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { GleanIndexClient } from './GleanIndexClient';
import { htmlFixture } from './fixtures/staticTechDocsHtml';
import { DocumentId, EntityUri, GleanDocument } from './types';
import { AuthService, DiscoveryService } from '@backstage/backend-plugin-api';
import { CatalogApi } from '@backstage/catalog-client';

describe('GleanIndexClient', () => {
  let gleanIndexClient: GleanIndexClient;
  const server = setupServer();
  const discoveryApi: DiscoveryService = {
    getBaseUrl: jest.fn(),
    getExternalBaseUrl: jest.fn(),
  };

  const auth = {
    getOwnServiceCredentials: jest
      .fn()
      .mockImplementation(async () => ({ token: 'I-am-a-token' })),
    getPluginRequestToken: () => ({ token: 'I-am-a-token' }),
  } as unknown as AuthService;

  const gleanApiIndexUrl =
    'https://customer-be.glean.com/api/index/v1/bulkindexdocuments';

  const config = new ConfigReader({
    backend: {
      baseUrl: 'http://localhost',
      listen: { port: 7000 },
    },
    app: {
      baseUrl: 'http://localhost',
      listen: { port: 3000 },
    },
    glean: {
      apiIndexUrl: gleanApiIndexUrl,
      token: 'I-am-a-token',
      datasource: 'I-am-a-datasource',
    },
  });

  const entityWithUrlRef: Entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'some-handbook-with-url-ref',
      namespace: 'default',
      annotations: {
        'backstage.io/techdocs-ref': 'url:some_url',
      },
      spec: {},
    },
  };
  const entityWithDirRef: Entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'some-handbook-with-dir-ref',
      namespace: 'default',
      annotations: {
        'backstage.io/techdocs-ref': 'dir:.',
      },
      spec: {},
    },
  };
  const entities = [entityWithUrlRef, entityWithDirRef];
  const catalogApi = catalogServiceMock({ entities }) as CatalogApi;

  beforeAll(() => server.listen());

  beforeEach(() => {
    gleanIndexClient = GleanIndexClient.create({
      auth,
      catalogApi,
      config,
      discoveryApi,
      logger: mockServices.logger.mock(),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    server.resetHandlers();
  });

  afterAll(() => server.close());

  describe('create', () => {
    it('returns a new instance of GleanIndexClient', () => {
      expect(
        GleanIndexClient.create({
          auth,
          catalogApi,
          config,
          discoveryApi,
          logger: mockServices.logger.mock(),
        }),
      ).toBeInstanceOf(GleanIndexClient);
    });
  });

  describe('parseMainContent', () => {
    it('removes all nav elements from HTML', () => {
      expect(htmlFixture).toEqual(expect.stringContaining('<nav'));
      // eslint-disable-next-line dot-notation
      expect(gleanIndexClient['parseMainContent'](htmlFixture)).toEqual(
        expect.not.stringContaining('<nav'),
      );
    });
  });

  describe('buildDocument', () => {
    beforeEach(() => {
      // eslint-disable-next-line dot-notation
      gleanIndexClient['techDocsClient'].getTechDocsStaticFile = jest
        .fn()
        .mockResolvedValue(htmlFixture);
    });

    it('returns a document object', async () => {
      expect(
        await gleanIndexClient.buildDocument(
          entityWithUrlRef,
          'foo/index.html',
        ),
      ).toEqual({
        id: 'default/component/some-handbook-with-url-ref/foo/index.html',
        title: 'Engineering Handbook',
        container: 'default/component/some-handbook-with-url-ref',
        datasource: 'I-am-a-datasource',
        viewURL:
          'http://localhost/docs/default/component/some-handbook-with-url-ref/foo',
        body: {
          mimeType: 'HTML',
          textContent: expect.stringContaining(
            "Welcome to Company's Engineering Handbook!",
          ),
        },
        updatedAt: Math.floor(new Date('April 6, 2022').getTime() / 1000),
        permissions: { allowAnonymousAccess: true },
      });
    });
  });

  describe('batchIndexTechDocs', () => {
    const mockDocument: GleanDocument = {
      id: 'default/component/some-handbook/document-1' as DocumentId,
      title: 'I am a document',
      container: 'default/component/some-handbook' as EntityUri,
      datasource: 'I-am-a-datasource',
      viewURL: 'http://backstage.w10e.com',
      body: {
        mimeType: 'HTML',
        textContent: 'I am some text content',
      },
      updatedAt: 1652818028,
      permissions: { allowAnonymousAccess: true },
    };

    const mockTechDocsMetadata: TechDocsMetadata = {
      site_name: 'some-handbook',
      site_description: 'Company&#x27,s Engineering Handbook',
      etag: '38cf6ed97f8c501426a0e311b76d67c69fc46df3',
      build_timestamp: 1652796973948,
      files: ['index.html', 'interviewing/index.html', 'onboarding.html'],
    };

    beforeEach(() => {
      jest
        .spyOn(gleanIndexClient, 'buildDocument')
        .mockResolvedValue(mockDocument);
      jest
        .spyOn(gleanIndexClient, 'indexDocuments')
        .mockResolvedValue('response');

      // eslint-disable-next-line dot-notation
      gleanIndexClient['techDocsClient'].getTechDocsMetadata = jest
        .fn()
        .mockResolvedValue(mockTechDocsMetadata);

      server.use(
        rest.post(`${gleanApiIndexUrl}`, (_req, res, ctx) => {
          return res(ctx.status(200));
        }),
      );
    });

    it('uploads the Glean documents', async () => {
      const indexTechDocs = await gleanIndexClient.batchIndexDocuments(
        'upload-',
        [mockDocument],
      );
      expect(gleanIndexClient.indexDocuments).toHaveBeenCalledTimes(1);
      expect(indexTechDocs).toEqual(1);
    });

    it('builds and uploads the Glean documents for all entities', async () => {
      const batchIndexTechDocs = await gleanIndexClient.batchIndexTechDocs(
        entities,
      );
      expect(batchIndexTechDocs.uploadId).toContain('upload-');
      expect(batchIndexTechDocs.batchCount).toEqual(1);
    });

    describe('when there are no files to index', () => {
      beforeEach(() => {
        // eslint-disable-next-line dot-notation
        gleanIndexClient['techDocsClient'].getTechDocsMetadata = jest
          .fn()
          .mockResolvedValue({ ...mockTechDocsMetadata, files: [] });
      });

      it('does not index tech docs with Glean', async () => {
        const batchIndexTechDocs = await gleanIndexClient.batchIndexTechDocs(
          [],
        );
        expect(gleanIndexClient.buildDocument).not.toHaveBeenCalled();
        expect(batchIndexTechDocs.uploadId).toContain('upload-');
        expect(batchIndexTechDocs.batchCount).toEqual(0);
      });
    });
  });

  describe('batchIndex', () => {
    beforeEach(() => {
      jest.spyOn(gleanIndexClient, 'batchIndexTechDocs').mockResolvedValue({
        uploadId: 'upload-7bbf4c41-b73a-4ca2-8245-a23a0c4f37e7',
        batchCount: 1,
      });
    });

    it('indexes the TechDocs entities', async () => {
      await gleanIndexClient.batchIndex(entities);
      expect(gleanIndexClient.batchIndexTechDocs).toHaveBeenCalledTimes(1);
    });
  });
});
