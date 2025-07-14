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

import { TableColumn } from '@backstage/core-components';
import {
  AnyApiRef,
  configApiRef,
  errorApiRef,
} from '@backstage/core-plugin-api';
import { UrlPatternDiscovery, ConfigReader } from '@backstage/core-app-api';

import { fireEvent, render } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ArgoCDApiClient, argoCDApiRef } from './api';
import { argocdPlugin } from './plugin';
import { ArgoCDDetailsCard } from './components/ArgoCDDetailsCard';
import { TestApiProvider } from '@backstage/test-utils';
import {
  getEntityStub,
  getResponseStub,
  getResponseStubScanning,
  getResponseStubAppListForInstanceOne,
  getResponseStubAppListForInstanceTwo,
  getResponseStubAppListWithMultipleApps,
  getResponseStubMissingData,
  getEntityStubWithAppSelector,
  getEmptyResponseStub,
  getIdentityApiStub,
  getResponseStubNamespaced,
  getEntityStubWithAppNamespace,
} from './mocks/mocks';
import { EntityProvider } from '@backstage/plugin-catalog-react';

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');
const errorApiMock = { post: jest.fn(), error$: jest.fn() };

const apis: [AnyApiRef, Partial<unknown>][] = [
  [configApiRef, new ConfigReader({})],
  [errorApiRef, errorApiMock],
  [
    argoCDApiRef,
    new ArgoCDApiClient({
      discoveryApi,
      identityApi: getIdentityApiStub,
      backendBaseUrl: 'https://testbackend.com',
      searchInstances: false,
      useNamespacedApps: false,
    }),
  ],
];
const apisScan: [AnyApiRef, Partial<unknown>][] = [
  [
    configApiRef,
    new ConfigReader({
      argocd: {
        namespacedApps: false,
        appLocatorMethods: [
          {
            type: 'config',
            instances: [
              {
                url: 'https://testrancher.com',
                name: 'argoInstance1',
              },
            ],
          },
        ],
      },
    }),
  ],
  [errorApiRef, errorApiMock],
  [
    argoCDApiRef,
    new ArgoCDApiClient({
      discoveryApi,
      identityApi: getIdentityApiStub,
      backendBaseUrl: 'https://testbackend.com',
      searchInstances: true,
      useNamespacedApps: false,
    }),
  ],
];
const apisScanMultipleInstances: [AnyApiRef, Partial<unknown>][] = [
  [
    configApiRef,
    new ConfigReader({
      argocd: {
        namespacedApps: false,
        appLocatorMethods: [
          {
            type: 'config',
            instances: [
              {
                url: 'https://testrancher.com',
                name: 'argoInstance1',
              },
              {
                url: 'https://testranchertwo.com',
                name: 'argoInstance2',
              },
            ],
          },
        ],
      },
    }),
  ],
  [errorApiRef, errorApiMock],
  [
    argoCDApiRef,
    new ArgoCDApiClient({
      discoveryApi,
      identityApi: getIdentityApiStub,
      backendBaseUrl: 'https://testbackend.com',
      searchInstances: true,
      useNamespacedApps: false,
    }),
  ],
];

describe('argo-cd', () => {
  const worker = setupServer();
  beforeAll(() => worker.listen());
  afterAll(() => worker.close());
  afterEach(() => worker.resetHandlers());

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('export-plugin', () => {
    it('should export plugin', () => {
      expect(argocdPlugin).toBeDefined();
    });
  });

  describe('widget', () => {
    it('should display fetched data', async () => {
      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(getResponseStub))),
      );
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText('guestbook')).toBeInTheDocument();
      expect(await rendered.findByText('guestbook')).not.toHaveAttribute(
        'href',
      );
      expect(await rendered.findByText('Synced')).toBeInTheDocument();
      expect(await rendered.findByText('Healthy')).toBeInTheDocument();
    });

    it('should display empty table when no item returned with app selector', async () => {
      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(getEmptyResponseStub))),
      );
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );

      expect(
        await rendered.findByText('No records to display'),
      ).toBeInTheDocument();
    });

    it('should display link to argo cd source', async () => {
      const apisWithArgoCDBaseURL: [AnyApiRef, Partial<unknown>][] = [
        [
          configApiRef,
          new ConfigReader({
            argocd: { baseUrl: 'www.example-argocd-url.com' },
          }),
        ],
        [errorApiRef, errorApiMock],
        [
          argoCDApiRef,
          new ArgoCDApiClient({
            discoveryApi,
            identityApi: getIdentityApiStub,
            backendBaseUrl: 'https://testbackend.com',
            searchInstances: false,
            useNamespacedApps: false,
          }),
        ],
      ];

      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(getResponseStub))),
      );

      const rendered = render(
        <TestApiProvider apis={apisWithArgoCDBaseURL}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      const drawerButton = await rendered.findByTitle('guestbook');
      fireEvent.click(drawerButton);
      expect(
        await rendered.findByTitle('Open Argo CD Dashboard'),
      ).toBeInTheDocument();
      expect(
        await rendered.findByTitle('Open Argo CD Dashboard'),
      ).toHaveAttribute(
        'href',
        'www.example-argocd-url.com/applications/guestbook',
      );
    });

    it('should display extra column', async () => {
      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(getResponseStub))),
      );

      const extraColumns: TableColumn[] = [
        {
          title: 'Repo URL',
          field: 'spec.source.repoURL',
        },
      ];

      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard extraColumns={extraColumns} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText('Repo URL')).toBeInTheDocument();
      expect(
        await rendered.findByText(
          'https://github.com/argoproj/argocd-example-apps',
        ),
      ).toBeInTheDocument();
    });

    it('should display new data on retry', async () => {
      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(getResponseStub))),
      );

      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );

      expect(await rendered.findByText('guestbook')).toBeInTheDocument();
      expect(await rendered.findByText('Synced')).toBeInTheDocument();

      const nextResponseStub = JSON.parse(JSON.stringify(getResponseStub));
      nextResponseStub.status.sync.status = 'OutOfSync';

      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(nextResponseStub))),
      );

      const refreshButton = await rendered.findByTitle('Refresh');
      fireEvent.click(refreshButton);

      expect(await rendered.findByText('guestbook')).toBeInTheDocument();
      expect(await rendered.findByText('OutOfSync')).toBeInTheDocument();
    });

    it('should display properly failure status codes', async () => {
      worker.use(rest.get('*', (_, res, ctx) => res(ctx.status(403))));
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText(/403/)).toBeInTheDocument();
    });

    it('should display data validation errors', async () => {
      worker.use(
        rest.get('*', (_, res, ctx) =>
          res(ctx.json(getResponseStubMissingData)),
        ),
      );
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(
        await rendered.findByText(/remote data validation failed: /),
      ).toBeInTheDocument();
    });

    it('should display namespaced apps', async () => {
      const apisWithArgoCDNamespacedApps: [AnyApiRef, Partial<unknown>][] = [
        [
          configApiRef,
          new ConfigReader({
            argocd: { namespacedApps: true },
          }),
        ],
        [errorApiRef, errorApiMock],
        [
          argoCDApiRef,
          new ArgoCDApiClient({
            discoveryApi,
            identityApi: getIdentityApiStub,
            backendBaseUrl: 'https://testbackend.com',
            searchInstances: false,
            useNamespacedApps: true,
          }),
        ],
      ];
      worker.use(
        rest.get('*', (_, res, ctx) =>
          res(ctx.json(getResponseStubNamespaced)),
        ),
      );
      const rendered = render(
        <TestApiProvider apis={apisWithArgoCDNamespacedApps}>
          <EntityProvider entity={getEntityStubWithAppNamespace}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(
        await rendered.findByText('namespaced-guestbook'),
      ).toBeInTheDocument();
      expect(
        await rendered.findByText('namespaced-guestbook'),
      ).not.toHaveAttribute('href');
      expect(await rendered.findByText('Synced')).toBeInTheDocument();
      expect(await rendered.findByText('Healthy')).toBeInTheDocument();
    });

    it('should display namespaced apps with a base url', async () => {
      const apisWithArgoCDBaseURLAndNamespacedApps: [
        AnyApiRef,
        Partial<unknown>,
      ][] = [
        [
          configApiRef,
          new ConfigReader({
            argocd: {
              namespacedApps: true,
              baseUrl: 'www.example-argocd-url.com',
            },
          }),
        ],
        [errorApiRef, errorApiMock],
        [
          argoCDApiRef,
          new ArgoCDApiClient({
            discoveryApi,
            identityApi: getIdentityApiStub,
            backendBaseUrl: 'https://testbackend.com',
            searchInstances: false,
            useNamespacedApps: true,
          }),
        ],
      ];

      worker.use(
        rest.get('*', (_, res, ctx) =>
          res(ctx.json(getResponseStubNamespaced)),
        ),
      );

      const rendered = render(
        <TestApiProvider apis={apisWithArgoCDBaseURLAndNamespacedApps}>
          <EntityProvider entity={getEntityStubWithAppNamespace}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      const drawerButton = await rendered.findByTitle('namespaced-guestbook');
      fireEvent.click(drawerButton);
      expect(
        await rendered.findByTitle('Open Argo CD Dashboard'),
      ).toBeInTheDocument();
      expect(
        await rendered.findByTitle('Open Argo CD Dashboard'),
      ).toHaveAttribute(
        'href',
        'www.example-argocd-url.com/applications/my-test-ns/namespaced-guestbook',
      );
    });
  });
  describe('widget - scan instances', () => {
    it('should display fetched data', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/name/guestbook',
          (_, res, ctx) =>
            res(
              ctx.json([
                {
                  name: 'argoInstance1',
                  url: 'https://argocd-argoInstance1.com',
                },
              ]),
            ),
        ),
      );
      worker.use(
        rest.post('*', (_, res, ctx) =>
          res(ctx.json({ items: [{ instance: { name: 'argoInstance1' } }] })),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook',
          (_, res, ctx) => res(ctx.json(getResponseStubScanning)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );
      const rendered = render(
        <TestApiProvider apis={apisScan}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText('guestbook')).toBeInTheDocument();
      expect(await rendered.findByText('guestbook')).not.toHaveAttribute(
        'href',
      );
      expect(await rendered.findByText('Synced')).toBeInTheDocument();
      expect(await rendered.findByText('Healthy')).toBeInTheDocument();
    });

    it('should display empty table when no item returned with app selector', async () => {
      worker.use(
        rest.post('*', (_, res, ctx) =>
          res(ctx.json({ items: [{ instance: { name: 'argoInstance1' } }] })),
        ),
      );
      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(getEmptyResponseStub))),
      );
      const rendered = render(
        <TestApiProvider apis={apis}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );

      expect(
        await rendered.findByText('No records to display'),
      ).toBeInTheDocument();
    });

    it('should display link to argo cd source', async () => {
      const apisWithArgoCDBaseURL: [AnyApiRef, Partial<unknown>][] = [
        [
          configApiRef,
          new ConfigReader({
            argocd: {
              baseUrl: 'www.example-argocd-url.com',
              appLocatorMethods: [
                {
                  type: 'config',
                  instances: [
                    {
                      url: 'https://testrancher.com',
                      name: 'argoInstance1',
                    },
                  ],
                },
              ],
            },
          }),
        ],
        [errorApiRef, errorApiMock],
        [
          argoCDApiRef,
          new ArgoCDApiClient({
            discoveryApi,
            identityApi: getIdentityApiStub,
            backendBaseUrl: 'https://testbackend.com',
            searchInstances: true,
            useNamespacedApps: false,
          }),
        ],
      ];

      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/name/guestbook',
          (_, res, ctx) =>
            res(
              ctx.json([
                {
                  name: 'argoInstance1',
                  url: 'https://argocd-argoInstance1.com',
                },
              ]),
            ),
        ),
      );
      worker.use(
        rest.post('*', (_, res, ctx) =>
          res(ctx.json({ items: [{ instance: { name: 'argoInstance1' } }] })),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook',
          (_, res, ctx) => res(ctx.json(getResponseStub)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );

      const rendered = render(
        <TestApiProvider apis={apisWithArgoCDBaseURL}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      const drawerButton = await rendered.findByTitle('guestbook');
      fireEvent.click(drawerButton);
      expect(
        await rendered.findByTitle('Open Argo CD Dashboard'),
      ).toBeInTheDocument();
      expect(
        await rendered.findByTitle('Open Argo CD Dashboard'),
      ).toHaveAttribute(
        'href',
        'www.example-argocd-url.com/applications/guestbook',
      );
    });

    it('should display link to argo cd source using instance url', async () => {
      const apisWithArgoCDBaseURL: [AnyApiRef, Partial<unknown>][] = [
        [
          configApiRef,
          new ConfigReader({
            argocd: {
              appLocatorMethods: [
                {
                  type: 'config',
                  instances: [
                    {
                      url: 'https://testrancher.com',
                      name: 'argoInstance1',
                    },
                  ],
                },
              ],
            },
          }),
        ],
        [errorApiRef, errorApiMock],
        [
          argoCDApiRef,
          new ArgoCDApiClient({
            discoveryApi,
            identityApi: getIdentityApiStub,
            backendBaseUrl: 'https://testbackend.com',
            searchInstances: true,
            useNamespacedApps: false,
          }),
        ],
      ];

      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/name/guestbook',
          (_, res, ctx) =>
            res(
              ctx.json([
                {
                  name: 'argoInstance1',
                  url: 'https://argocd-argoInstance1.com',
                },
              ]),
            ),
        ),
      );
      worker.use(
        rest.post('*', (_, res, ctx) =>
          res(ctx.json({ items: [{ instance: { name: 'argoInstance1' } }] })),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook',
          (_, res, ctx) => res(ctx.json(getResponseStub)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );

      const rendered = render(
        <TestApiProvider apis={apisWithArgoCDBaseURL}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      const drawerButton = await rendered.findByTitle('guestbook');
      fireEvent.click(drawerButton);
      expect(
        await rendered.findByTitle('Open Argo CD Dashboard'),
      ).toBeInTheDocument();
      expect(
        await rendered.findByTitle('Open Argo CD Dashboard'),
      ).toHaveAttribute(
        'href',
        'https://testrancher.com/applications/guestbook',
      );
    });

    it('should display extra column', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/name/guestbook',
          (_, res, ctx) =>
            res(
              ctx.json([
                {
                  name: 'argoInstance1',
                  url: 'https://argocd-argoInstance1.com',
                },
              ]),
            ),
        ),
      );
      worker.use(
        rest.post('*', (_, res, ctx) =>
          res(ctx.json({ items: [{ instance: { name: 'argoInstance1' } }] })),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook',
          (_, res, ctx) => res(ctx.json(getResponseStub)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );

      const extraColumns: TableColumn[] = [
        {
          title: 'Repo URL',
          field: 'spec.source.repoURL',
        },
      ];

      const rendered = render(
        <TestApiProvider apis={apisScan}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard extraColumns={extraColumns} />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText('Repo URL')).toBeInTheDocument();
      expect(
        await rendered.findByText(
          'https://github.com/argoproj/argocd-example-apps',
        ),
      ).toBeInTheDocument();
    });

    it('should display properly failure status codes', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/name/guestbook',
          (_, res, ctx) =>
            res(
              ctx.json([
                {
                  name: 'argoInstance1',
                  url: 'https://argocd-argoInstance1.com',
                },
              ]),
            ),
        ),
      );
      worker.use(
        rest.post('*', (_, res, ctx) =>
          res(ctx.json({ items: [{ instance: { name: 'argoInstance1' } }] })),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook',
          (_, res, ctx) => res(ctx.status(403)),
        ),
      );
      const rendered = render(
        <TestApiProvider apis={apisScan}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText(/403/)).toBeInTheDocument();
    });

    it('should display data validation errors', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/name/guestbook',
          (_, res, ctx) =>
            res(
              ctx.json([
                {
                  name: 'argoInstance1',
                  url: 'https://argocd-argoInstance1.com',
                },
              ]),
            ),
        ),
      );
      worker.use(
        rest.post('*', (_, res, ctx) =>
          res(ctx.json({ items: [{ instance: { name: 'argoInstance1' } }] })),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook',
          (_, res, ctx) => res(ctx.json(getResponseStubMissingData)),
        ),
      );
      const rendered = render(
        <TestApiProvider apis={apisScan}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(
        await rendered.findByText(/remote data validation failed: /),
      ).toBeInTheDocument();
    });
  });

  describe('widget - scan instances with selector', () => {
    it('should display fetched data from one instance', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/selector/name%3dguestbook',
          (_, res, ctx) =>
            res(
              ctx.json([
                {
                  name: 'argoInstance1',
                  url: 'https://argocd-argoInstance1.com',
                },
              ]),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/selector/name%3dguestbook',
          (_, res, ctx) => res(ctx.json(getResponseStubAppListForInstanceOne)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );
      const rendered = render(
        <TestApiProvider apis={apisScan}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText('guestbook')).toBeInTheDocument();
      expect(await rendered.findByText('guestbook')).not.toHaveAttribute(
        'href',
      );
      expect(await rendered.findByText('Synced')).toBeInTheDocument();
      expect(await rendered.findByText('Healthy')).toBeInTheDocument();
    });
    it('should display fetched data from multiple instances', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/selector/name%3dguestbook',
          (_, res, ctx) =>
            res(
              ctx.json([
                {
                  name: 'argoInstance1',
                  url: 'https://argocd-argoInstance1.com',
                },
                {
                  name: 'argoInstance2',
                  url: 'https://argocd-argoInstance2.com',
                },
              ]),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/selector/name%3dguestbook',
          (_, res, ctx) => res(ctx.json(getResponseStubAppListForInstanceOne)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance2/applications/selector/name%3dguestbook',
          (_, res, ctx) =>
            res(ctx.json(getResponseStubAppListForInstanceTwo())),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance2/applications/name/guestbook/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );
      const rendered = render(
        <TestApiProvider apis={apisScanMultipleInstances}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      const apps = await rendered.findAllByText('guestbook');
      expect(apps).toHaveLength(2);
      expect(await rendered.findByText('argoInstance1')).toBeInTheDocument();
      expect(await rendered.findByText('argoInstance2')).toBeInTheDocument();
    });
    it('should display fetched data from multiple instances with multiple apps', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/selector/name%3dguestbook',
          (_, res, ctx) =>
            res(
              ctx.json([
                {
                  name: 'argoInstance1',
                  url: 'https://argocd-argoInstance1.com',
                },
                {
                  name: 'argoInstance2',
                  url: 'https://argocd-argoInstance2.com',
                },
              ]),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/selector/name%3dguestbook',
          (_, res, ctx) =>
            res(ctx.json(getResponseStubAppListWithMultipleApps)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook-prod/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook-staging/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook-nohistory/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance2/applications/selector/name%3dguestbook',
          (_, res, ctx) =>
            res(ctx.json(getResponseStubAppListForInstanceTwo())),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance2/applications/name/guestbook/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );
      const rendered = render(
        <TestApiProvider apis={apisScanMultipleInstances}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText('guestbook-prod')).toBeInTheDocument();
      expect(
        await rendered.findByText('guestbook-staging'),
      ).toBeInTheDocument();
      expect(
        await rendered.findByText('guestbook-nohistory'),
      ).toBeInTheDocument();

      const apps = await rendered.findAllByText('argoInstance1');
      expect(apps).toHaveLength(3);
      expect(await rendered.findByText('argoInstance2')).toBeInTheDocument();
    });
    it('should display fetched data from an instance when scanning multiple instances', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/selector/name%3dguestbook',
          (_, res, ctx) =>
            res(
              ctx.json([
                {
                  name: 'argoInstance1',
                  url: 'https://argocd-argoInstance1.com',
                },
                {
                  name: 'argoInstance2',
                  url: 'https://argocd-argoInstance2.com',
                },
              ]),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/selector/name%3dguestbook',
          (_, res, ctx) =>
            res(ctx.json(getResponseStubAppListWithMultipleApps)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook-prod/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook-staging/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/name/guestbook-nohistory/revisions/6bed858de32a0e876ec49dad1a2e3c5840d3fb07/metadata',
          (_, res, ctx) =>
            res(
              ctx.json({
                author: 'testuser <testuser@test.com>',
                date: '2023-03-20T18:44:10Z',
                message: 'Update README.md',
              }),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance2/applications/selector/name%3dguestbook',
          (_, res, ctx) => res(ctx.json(getEmptyResponseStub)),
        ),
      );
      const rendered = render(
        <TestApiProvider apis={apisScanMultipleInstances}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );
      expect(await rendered.findByText('guestbook-prod')).toBeInTheDocument();
      expect(
        await rendered.findByText('guestbook-staging'),
      ).toBeInTheDocument();
      expect(
        await rendered.findByText('guestbook-nohistory'),
      ).toBeInTheDocument();

      const apps = await rendered.findAllByText('argoInstance1');
      expect(apps).toHaveLength(3);
      expect(rendered.queryByText('argoInstance2')).toBeNull();
    });
    it('should display an empty table when receiving no data from multiple instances', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/selector/name%3dguestbook',
          (_, res, ctx) =>
            res(
              ctx.json([
                {
                  name: 'argoInstance1',
                  url: 'https://argocd-argoInstance1.com',
                },
                {
                  name: 'argoInstance2',
                  url: 'https://argocd-argoInstance2.com',
                },
              ]),
            ),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/selector/name%3dguestbook',
          (_, res, ctx) => res(ctx.json(getEmptyResponseStub)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance2/applications/selector/name%3dguestbook',
          (_, res, ctx) => res(ctx.json(getEmptyResponseStub)),
        ),
      );
      const rendered = render(
        <TestApiProvider apis={apisScanMultipleInstances}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </TestApiProvider>,
      );

      expect(
        await rendered.findByText('No records to display'),
      ).toBeInTheDocument();
      expect(rendered.queryByText('argoInstance1')).toBeNull();
      expect(rendered.queryByText('argoInstance2')).toBeNull();
    });
  });
});
