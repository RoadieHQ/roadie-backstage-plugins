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
import { render } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  mockApis,
  registerMswTestHooks,
  TestApiProvider,
} from '@backstage/test-utils';
import { TableColumn } from '@backstage/core-components';
import {
  configApiRef,
  errorApiRef,
  AnyApiRef,
} from '@backstage/core-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { PrometheusAlertEntityWrapper } from './PrometheusAlertEntityWrapper';
import { prometheusApiRef } from '../../api';
import { ThemeProvider } from '@material-ui/core';
import { lightTheme } from '@backstage/theme';
import { PrometheusDisplayableAlert } from '../../types';
import { translationApiRef } from '@backstage/core-plugin-api/alpha';

const entityMock = {
  metadata: {
    namespace: 'default',
    annotations: {
      'prometheus.io/alert': 'test alert name',
    },
    name: 'sample-service',
    description:
      'A service for testing Backstage functionality. For example, we can trigger errors\non the sample-service, these are sent to Sentry, then we can view them in the \nBackstage plugin for Sentry.\n',
    uid: '33f123a4-e83e-4d3f-8baa-631266c5638b',
    etag: 'ZTVmZThhZDctN2VkYi00OTI5LTlkZDMtZTBkNDA4ODg3NDQ4',
    generation: 1,
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
};

const config = {
  getOptionalConfigArray: (_: string) => [
    { getOptionalString: (_s: string) => 'test.server/url' },
  ],
};

const mockPrometheusApi = {
  getAlerts: () => require('../../mocks/mockAlertResponse.json'),
  getUiUrl: () => undefined,
};

const apis: [AnyApiRef, Partial<unknown>][] = [
  [configApiRef, config],
  [errorApiRef, config],
  [prometheusApiRef, mockPrometheusApi],
  [translationApiRef, mockApis.translation()],
];

describe('PrometheusAlertEntityWrapper', () => {
  const server = setupServer();
  // Enable sane handlers for network requests
  registerMswTestHooks(server);

  // setup mock response
  beforeEach(() => {
    server.use(
      rest.get('test.server/url/*', (_, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json(require('../../mocks/mockAlertResponse.json')),
        ),
      ),
    );
  });
  it('should render container for queries', async () => {
    const rendered = render(
      <ThemeProvider theme={lightTheme}>
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <PrometheusAlertEntityWrapper />
          </EntityProvider>
        </TestApiProvider>
      </ThemeProvider>,
    );
    expect(await rendered.findByText('Prometheus Alerts')).toBeInTheDocument();
    expect(await rendered.findByText('firing')).toBeInTheDocument();
    expect(await rendered.queryByText('Summary')).not.toBeInTheDocument();
  });

  it('should render extended table', async () => {
    const extraColumns: TableColumn<PrometheusDisplayableAlert>[] = [
      {
        title: 'Summary',
        field: 'annotations.summary',
      },
    ];
    const rendered = render(
      <ThemeProvider theme={lightTheme}>
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <PrometheusAlertEntityWrapper extraColumns={extraColumns} />
          </EntityProvider>
        </TestApiProvider>
      </ThemeProvider>,
    );
    expect(await rendered.findByText('Summary')).toBeInTheDocument();
  });

  it('should render compontent with clickable rows', async () => {
    const dummyCallback = jest.fn();
    const rendered = render(
      <ThemeProvider theme={lightTheme}>
        <TestApiProvider apis={apis}>
          <EntityProvider entity={entityMock}>
            <PrometheusAlertEntityWrapper onRowClick={dummyCallback} />
          </EntityProvider>
        </TestApiProvider>
      </ThemeProvider>,
    );

    const cell = await rendered.findByText('firing');
    const row = await cell.closest('tr');
    expect(cell).toBeInTheDocument();
    expect(row).toBeInTheDocument();
    expect(row?.onclick).toBeTruthy();
    expect(row).toHaveStyle('cursor: pointer');
  });
});
