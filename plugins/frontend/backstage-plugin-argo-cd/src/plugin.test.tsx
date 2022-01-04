/*
 * Copyright 2020 RoadieHQ
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

import React from 'react';
import { TableColumn } from '@backstage/core-components';
import { configApiRef, errorApiRef } from '@backstage/core-plugin-api';
import {
  ApiProvider,
  ApiRegistry,
  UrlPatternDiscovery,
  ConfigReader,
} from '@backstage/core-app-api';

import { fireEvent, render } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ArgoCDApiClient, argoCDApiRef } from './api';
import { argocdPlugin } from './plugin';
import { ArgoCDDetailsCard } from './components/ArgoCDDetailsCard';
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
} from './mocks/mocks';
import { EntityProvider } from '@backstage/plugin-catalog-react';

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');
const errorApiMock = { post: jest.fn(), error$: jest.fn() };

const apis = ApiRegistry.from([
  [
    configApiRef,
    new ConfigReader({
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
    }),
  ],
]);
const apisScan = ApiRegistry.from([
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
    }),
  ],
]);
const apisScanMultipleInstances = ApiRegistry.from([
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
              {
                url: 'https://testranchertwo.com',
                name: 'argoInstance2',
              }
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
    }),
  ],
]);


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
        rest.get('*', (_, res, ctx) => res(ctx.json(getResponseStub)))
      );
      const rendered = render(
        <ApiProvider apis={apis}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>
      );
      expect(await rendered.findByText('guestbook')).toBeInTheDocument();
      expect(await rendered.findByText('guestbook')).not.toHaveAttribute("href");
      expect(await rendered.findByText('Synced')).toBeInTheDocument();
      expect(await rendered.findByText('Healthy')).toBeInTheDocument();
    });

    it("should display empty table when no item returned with app selector", async () => {
      worker.use(
        rest.get("*", (_, res, ctx) => res(ctx.json(getEmptyResponseStub)))
      );
      const rendered = render(
        <ApiProvider apis={apis}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>
      );

      expect(
        await rendered.findByText("No records to display")
      ).toBeInTheDocument();
    });

    it('should display link to argo cd source', async () => {
      const apisWithArgoCDBaseURL = apis.with(
        configApiRef,
        new ConfigReader({ argocd: { baseUrl: "www.example-argocd-url.com" } })
      );

      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(getResponseStub)))
      );

      const rendered = render(
        <ApiProvider apis={apisWithArgoCDBaseURL}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>
      );
      expect(await rendered.findByText('guestbook')).toHaveAttribute('href', 'www.example-argocd-url.com/applications/guestbook');
    });

    it('should display extra column', async () => {
      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(getResponseStub)))
      );

      const extraColumns: TableColumn[] = [
        {
          title: "Repo URL",
          field: "spec.source.repoURL",
        },
      ];

      const rendered = render(
        <ApiProvider apis={apis}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard extraColumns={extraColumns} />
          </EntityProvider>
        </ApiProvider>
      );
      expect(await rendered.findByText('Repo URL')).toBeInTheDocument();
      expect(await rendered.findByText('https://github.com/argoproj/argocd-example-apps')).toBeInTheDocument();
    });

    it('should display new data on retry', async () => {
      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(getResponseStub)))
      );

      const rendered = render(
        <ApiProvider apis={apis}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>
      );

      expect(await rendered.findByText('guestbook')).toBeInTheDocument();
      expect(await rendered.findByText('Synced')).toBeInTheDocument();

      const nextResponseStub = JSON.parse(JSON.stringify(getResponseStub));
      nextResponseStub.status.sync.status = "OutOfSync";

      worker.use(
        rest.get('*', (_, res, ctx) => res(ctx.json(nextResponseStub)))
      );

      const refreshButton = await rendered.findByTitle("Refresh");
      fireEvent.click(refreshButton);

      expect(await rendered.findByText('guestbook')).toBeInTheDocument();
      expect(await rendered.findByText('OutOfSync')).toBeInTheDocument();
    });

    it('should display properly failure status codes', async () => {
      worker.use(rest.get('*', (_, res, ctx) => res(ctx.status(403))));
      const rendered = render(
        <ApiProvider apis={apis}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>
      );
      expect(await rendered.findByText(/403/)).toBeInTheDocument();
    });

    it('should display data validation errors', async () => {
      worker.use(
        rest.get('*', (_, res, ctx) =>
          res(ctx.json(getResponseStubMissingData))
        )
      );
      const rendered = render(
        <ApiProvider apis={apis}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>
      );
      expect(
        await rendered.findByText(/remote data validation failed: /)
      ).toBeInTheDocument();
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
      const rendered = render(
        <ApiProvider apis={apisScan}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>,
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
        <ApiProvider apis={apis}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>,
      );

      expect(
        await rendered.findByText('No records to display'),
      ).toBeInTheDocument();
    });

    it('should display link to argo cd source', async () => {
      const apisWithArgoCDBaseURL = apisScan.with(
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
      );

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

      const rendered = render(
        <ApiProvider apis={apisWithArgoCDBaseURL}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>,
      );
      expect(await rendered.findByText('guestbook')).toHaveAttribute(
        'href',
        'www.example-argocd-url.com/applications/guestbook',
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

      const extraColumns: TableColumn[] = [
        {
          title: 'Repo URL',
          field: 'spec.source.repoURL',
        },
      ];

      const rendered = render(
        <ApiProvider apis={apisScan}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard extraColumns={extraColumns} />
          </EntityProvider>
        </ApiProvider>,
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
        <ApiProvider apis={apisScan}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>,
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
        <ApiProvider apis={apisScan}>
          <EntityProvider entity={getEntityStub}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>,
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
          'https://testbackend.com/api/argocd/find/selector/name=guestbook',
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
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/selector/name=guestbook',
          (_, res, ctx) => res(ctx.json(getResponseStubAppListForInstanceOne)),
        ),
      );
      const rendered = render(
        <ApiProvider apis={apisScan}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>,
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
          'https://testbackend.com/api/argocd/find/selector/name=guestbook',
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
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/selector/name=guestbook',
          (_, res, ctx) => res(ctx.json(getResponseStubAppListForInstanceOne)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance2/applications/selector/name=guestbook',
          (_, res, ctx) => res(ctx.json(getResponseStubAppListForInstanceTwo())),
        ),
      );
      const rendered = render(
        <ApiProvider apis={apisScanMultipleInstances}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>,
      );
      const apps = await rendered.findAllByText('guestbook');
      expect(apps).toHaveLength(2);
      expect(await rendered.findByText('argoInstance1')).toBeInTheDocument();
      expect(await rendered.findByText('argoInstance2')).toBeInTheDocument();
    });
    it('should display fetched data from multiple instances with multiple apps', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/selector/name=guestbook',
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
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/selector/name=guestbook',
          (_, res, ctx) => res(ctx.json(getResponseStubAppListWithMultipleApps)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance2/applications/selector/name=guestbook',
          (_, res, ctx) => res(ctx.json(getResponseStubAppListForInstanceTwo())),
        ),
      );
      const rendered = render(
        <ApiProvider apis={apisScanMultipleInstances}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>,
      );
      expect(await rendered.findByText('guestbook-prod')).toBeInTheDocument();
      expect(await rendered.findByText('guestbook-staging')).toBeInTheDocument();

      const apps = await rendered.findAllByText('argoInstance1');
      expect(apps).toHaveLength(2);
      expect(await rendered.findByText('argoInstance2')).toBeInTheDocument();
    });
    it('should display fetched data from an instance when scanning multiple instances', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/selector/name=guestbook',
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
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/selector/name=guestbook',
          (_, res, ctx) => res(ctx.json(getResponseStubAppListWithMultipleApps)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance2/applications/selector/name=guestbook',
          (_, res, ctx) => res(ctx.json(getEmptyResponseStub)),
        ),
      );
      const rendered = render(
        <ApiProvider apis={apisScanMultipleInstances}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>,
      );
      expect(await rendered.findByText('guestbook-prod')).toBeInTheDocument();
      expect(await rendered.findByText('guestbook-staging')).toBeInTheDocument();

      const apps = await rendered.findAllByText('argoInstance1');
      expect(apps).toHaveLength(2);
      expect(rendered.queryByText('argoInstance2')).toBeNull();
    });
    it('should display an empty table when receiving no data from multiple instances', async () => {
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/find/selector/name=guestbook',
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
          'https://testbackend.com/api/argocd/argoInstance/argoInstance1/applications/selector/name=guestbook',
          (_, res, ctx) => res(ctx.json(getEmptyResponseStub)),
        ),
      );
      worker.use(
        rest.get(
          'https://testbackend.com/api/argocd/argoInstance/argoInstance2/applications/selector/name=guestbook',
          (_, res, ctx) => res(ctx.json(getEmptyResponseStub)),
        ),
      );
      const rendered = render(
        <ApiProvider apis={apisScanMultipleInstances}>
          <EntityProvider entity={getEntityStubWithAppSelector}>
            <ArgoCDDetailsCard />
          </EntityProvider>
        </ApiProvider>,
      );

      expect(await rendered.findByText('No records to display')).toBeInTheDocument();
      expect(rendered.queryByText('argoInstance1')).toBeNull();
      expect(rendered.queryByText('argoInstance2')).toBeNull();
    });
  });
});
