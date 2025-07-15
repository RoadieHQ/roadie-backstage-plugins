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
import { getVoidLogger } from '@backstage/backend-common';
import { Entity } from '@backstage/catalog-model';
import { ConfigReader } from '@backstage/config';
import { TechDocsMetadata } from '@backstage/plugin-techdocs-node';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { TechDocsClient } from './TechDocsClient';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';
import { CatalogApi } from '@backstage/catalog-client';
import { AuthService } from '@backstage/backend-plugin-api';

describe('TechDocsClient', () => {
  let techDocsClient: TechDocsClient;
  const server = setupServer();
  const discoveryApi = { getBaseUrl: jest.fn(), getExternalBaseUrl: jest.fn() };

  const auth = {
    getOwnServiceCredentials: jest
      .fn()
      .mockImplementation(async () => ({ token: 'I-am-a-token' })),
    getPluginRequestToken: () => ({ token: 'I-am-a-token' }),
  } as unknown as AuthService;

  const baseUrl = 'http://localhost/api';

  const config = new ConfigReader({
    backend: {
      baseUrl: 'http://localhost',
      listen: { port: 7000 },
    },
    app: {
      baseUrl: 'http://localhost',
      listen: { port: 3000 },
    },
  });

  const entityWithTechdocsRef: Entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'some-handbook',
      namespace: 'default',
      annotations: {
        'backstage.io/techdocs-ref': 'url:some_url',
      },
      spec: {},
    },
  };
  const entityWithoutTechdocsRef: Entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'some-handbook-no-techdocs-ref',
      namespace: 'default',
      spec: {},
    },
  };
  const entities = [entityWithTechdocsRef, entityWithoutTechdocsRef];
  const catalogApi = catalogServiceMock({ entities }) as CatalogApi;

  beforeAll(() => server.listen());

  beforeEach(() => {
    discoveryApi.getBaseUrl.mockResolvedValue(baseUrl);
    techDocsClient = TechDocsClient.create({
      auth,
      catalogApi,
      config,
      discoveryApi,
      logger: getVoidLogger(),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    server.resetHandlers();
  });

  afterAll(() => server.close());

  describe('create', () => {
    it('returns a new instance of techDocsClient', () => {
      expect(
        TechDocsClient.create({
          auth,
          catalogApi,
          config,
          logger: getVoidLogger(),
          discoveryApi,
        }),
      ).toBeInstanceOf(TechDocsClient);
    });
  });

  describe('getEntityUri', () => {
    it('returns the entity URI', () => {
      expect(techDocsClient.getEntityUri(entityWithTechdocsRef)).toEqual(
        'default/component/some-handbook',
      );
    });
  });

  describe('getViewUrl', () => {
    it('returns docs view URL', () => {
      expect(
        techDocsClient.getViewUrl(entityWithTechdocsRef, '/index.html'),
      ).toEqual('http://localhost/docs/default/component/some-handbook/');
      expect(
        techDocsClient.getViewUrl(entityWithTechdocsRef, 'foo/index.html'),
      ).toEqual('http://localhost/docs/default/component/some-handbook/foo');
      expect(
        techDocsClient.getViewUrl(entityWithTechdocsRef, 'foo/bar/index.html'),
      ).toEqual(
        'http://localhost/docs/default/component/some-handbook/foo/bar',
      );
      expect(
        techDocsClient.getViewUrl(entityWithTechdocsRef, 'foo/baz.html'),
      ).toEqual(
        'http://localhost/docs/default/component/some-handbook/foo/baz',
      );
    });
  });

  describe('getTechDocsEntitiesResponse', () => {
    describe('success', () => {
      it('returns all techdocs entities response', async () => {
        await expect(
          techDocsClient.getTechDocsEntitiesResponse(),
        ).resolves.toEqual({
          items: [entityWithTechdocsRef],
        });
      });
    });
  });
  describe('getTechDocsEntities', () => {
    describe('success', () => {
      it('returns all techdocs entities', async () => {
        await expect(techDocsClient.getTechDocsEntities()).resolves.toEqual([
          entityWithTechdocsRef,
        ]);
      });
    });
  });

  describe('getTechDocsMetadata', () => {
    describe('success', () => {
      const mockTechDocsMetadata: TechDocsMetadata = {
        site_name: 'some-handbook',
        site_description: 'A Handbook for All',
        build_timestamp: 1650391420971,
        files: ['index.html'],
        etag: '6b054808e307181fcac94061ed77a9397f506071',
      };

      beforeEach(() => {
        server.use(
          rest.get(
            `${baseUrl}/metadata/techdocs/default/component/some-handbook`,
            (_req, res, ctx) => {
              return res(ctx.status(200), ctx.json(mockTechDocsMetadata));
            },
          ),
        );
      });

      it('returns expected techdocs metadata', async () => {
        await expect(
          techDocsClient.getTechDocsMetadata(entityWithTechdocsRef),
        ).resolves.toEqual(mockTechDocsMetadata);
      });
    });

    describe('error case', () => {
      beforeEach(() => {
        server.use(
          rest.get(
            `${baseUrl}/metadata/techdocs/default/component/some-handbook-no-techdocs-ref`,
            (_req, res, ctx) => {
              return res(
                ctx.status(404),
                ctx.json({ errorMessage: 'Not Found' }),
              );
            },
          ),
        );
      });

      it('throws an error', async () => {
        await expect(
          techDocsClient.getTechDocsMetadata(entityWithoutTechdocsRef),
        ).rejects.toThrow('Not Found');
      });
    });
  });

  describe('getTechDocsStaticFile', () => {
    const filePath = 'foo/index.html';

    describe('success', () => {
      const mockTechDocsStaticFile = 'I am a static file';

      beforeEach(() => {
        server.use(
          rest.get(
            `${baseUrl}/static/docs/default/component/some-handbook/${filePath}`,
            (_req, res, ctx) => {
              return res(ctx.status(200), ctx.text(mockTechDocsStaticFile));
            },
          ),
        );
      });

      it('returns expected techdocs metadata', async () => {
        await expect(
          techDocsClient.getTechDocsStaticFile(entityWithTechdocsRef, filePath),
        ).resolves.toEqual(mockTechDocsStaticFile);
      });
    });

    describe('error case', () => {
      beforeEach(() => {
        server.use(
          rest.get(
            `${baseUrl}/static/docs/default/component/some-handbook/${filePath}`,
            (_req, res, ctx) => {
              return res(
                ctx.status(404),
                ctx.json({ errorMessage: 'Not Found' }),
              );
            },
          ),
        );
      });

      it('throws an error', async () => {
        await expect(
          techDocsClient.getTechDocsStaticFile(entityWithTechdocsRef, filePath),
        ).rejects.toThrow('Not Found');
      });
    });
  });

  describe('parseUpdatedAt', () => {
    it('returns the parsed date', () => {
      const mockRawHtml = `
        <html>
          <article>
            <h1 id="title">
              "This is the title"
              <a title="Permanent link" href="#title" class="headerlink">#</a></h1>
            <p>I am a file</p>
            <span class="git-revision-date-localized-plugin git-revision-date-localized-plugin-date">April 6, 2022</span>
          </article>
        </html>`;

      expect(techDocsClient.parseUpdatedAt(mockRawHtml)).toEqual(
        new Date('April 6, 2022'),
      );
    });
  });

  describe('parseTitle', () => {
    it('returns the text content of h1 as a title', () => {
      const mockRawHtml = `
        <html>
          <article>
            <h1 id="title">
              "This is the title with &amp; persand"
              <a title="Permanent link" href="#title" class="headerlink">#</a></h1>
            <p>I am a file</p>
            <span class="git-revision-date-localized-plugin git-revision-date-localized-plugin-date">April 6, 2022</span>
          </article>
        </html>`;

      expect(techDocsClient.parseTitle(mockRawHtml)).toEqual(
        'This is the title with & persand',
      );
    });

    describe('when there is no heading', () => {
      it('returns undefined', () => {
        const mockRawHtml = `
          <html>
            <article>
              <p>I am a file</p>
            </article>
          </html>`;

        expect(techDocsClient.parseTitle(mockRawHtml)).toEqual(undefined);
      });
    });
  });
});
