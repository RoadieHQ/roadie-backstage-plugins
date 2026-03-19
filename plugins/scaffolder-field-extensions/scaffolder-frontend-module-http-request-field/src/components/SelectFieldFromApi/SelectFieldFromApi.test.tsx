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

import { fireEvent, within } from '@testing-library/react';
import {
  renderWithEffects,
  TestApiProvider,
  wrapInTestApp,
} from '@backstage/test-utils';
import { SelectFieldFromApi } from './SelectFieldFromApi';
import {
  AnyApiRef,
  discoveryApiRef,
  fetchApiRef,
  githubAuthApiRef,
  OAuthApi,
} from '@backstage/core-plugin-api';
import { FieldExtensionComponentProps } from '@backstage/plugin-scaffolder-react';
import Mocked = jest.Mocked;

describe('SelectFieldFromApi', () => {
  const fetchApi = { fetch: jest.fn() };

  const discovery = {
    async getBaseUrl(plugin: string) {
      return `http://backstage.tests/api/${plugin}`;
    },
  };

  const mockGithubAuthApi: Mocked<OAuthApi> = {
    getAccessToken: jest.fn(),
  };

  const apis: [AnyApiRef, any][] = [
    [fetchApiRef, fetchApi],
    [discoveryApiRef, discovery],
    [githubAuthApiRef, mockGithubAuthApi],
  ];

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should use response body directly where there is no arraySelector', async () => {
    fetchApi.fetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue(['result1', 'result2']),
    });
    const uiSchema = { 'ui:options': { path: '/test-endpoint' } };
    const props = {
      uiSchema,
      formContext: { formData: {} },
    } as unknown as FieldExtensionComponentProps<string | string[]>;
    const { getByTestId, getByText } = await renderWithEffects(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <SelectFieldFromApi {...props} />
        </TestApiProvider>,
      ),
    );
    const input = getByTestId('select');
    expect(input.textContent).toBe('Select from results');
    fireEvent.mouseDown(within(input).getByRole('button'));

    expect(getByText('result1')).toBeInTheDocument();
    expect(getByText('result2')).toBeInTheDocument();
  });

  it('should fail if response is not ok', async () => {
    fetchApi.fetch.mockResolvedValueOnce({
      status: 403,
      ok: false,
      statusText: 'Not Authorized',
      json: jest.fn().mockResolvedValue(['result1', 'result2']),
    });
    const uiSchema = { 'ui:options': { path: '/test-endpoint' } };
    const props = {
      uiSchema,
      formContext: { formData: {} },
    } as unknown as FieldExtensionComponentProps<string | string[]>;
    const { getByText } = await renderWithEffects(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <SelectFieldFromApi {...props} />
        </TestApiProvider>,
      ),
    );

    expect(
      getByText('Error: Failed to retrieve data from API: Not Authorized'),
    ).toBeInTheDocument();
  });

  it('should fail if response is 200 and I explicitly ask for 201', async () => {
    fetchApi.fetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue(['result1', 'result2']),
    });
    const uiSchema = {
      'ui:options': { path: '/test-endpoint', successStatusCode: 201 },
    };
    const props = {
      uiSchema,
      formContext: { formData: {} },
    } as unknown as FieldExtensionComponentProps<string | string[]>;
    const { getByText } = await renderWithEffects(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <SelectFieldFromApi {...props} />
        </TestApiProvider>,
      ),
    );
    expect(
      getByText('Error: Failed to retrieve data from API: OK'),
    ).toBeInTheDocument();
  });

  it('should use array specified by arraySelector', async () => {
    fetchApi.fetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue({ myarray: ['result1', 'result2'] }),
    });
    const uiSchema = {
      'ui:options': { path: '/test-endpoint', arraySelector: 'myarray' },
    };
    const props = {
      uiSchema,
      formContext: { formData: {} },
    } as unknown as FieldExtensionComponentProps<string | string[]>;
    const { getByTestId, getByText } = await renderWithEffects(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <SelectFieldFromApi {...props} />
        </TestApiProvider>,
      ),
    );
    const input = getByTestId('select');
    expect(input.textContent).toBe('Select from results');
    fireEvent.mouseDown(within(input).getByRole('button'));

    expect(getByText('result1')).toBeInTheDocument();
    expect(getByText('result2')).toBeInTheDocument();
  });

  it('should pass an access token through in the Authorization header if "oauth" is configured', async () => {
    fetchApi.fetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue({ myarray: ['result1', 'result2'] }),
    });
    mockGithubAuthApi.getAccessToken.mockResolvedValue('my-github-auth-token');
    const uiSchema = {
      'ui:options': {
        path: '/test-endpoint',
        arraySelector: 'myarray',
        oauth: { provider: 'github', scopes: ['repo'] },
      },
    };
    const props = {
      uiSchema,
      formContext: { formData: {} },
    } as unknown as FieldExtensionComponentProps<string | string[]>;

    await renderWithEffects(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <SelectFieldFromApi {...props} />
        </TestApiProvider>,
      ),
    );

    expect(mockGithubAuthApi.getAccessToken).toHaveBeenCalledWith(
      ['repo'],
      expect.anything(),
    );
    expect(fetchApi.fetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: { Authorization: 'Bearer my-github-auth-token' },
      }),
    );
  });

  it('should use labelTemplate to format the label when provided', async () => {
    fetchApi.fetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue([
        { spec: { namespace: 'main' }, metadata: { name: 'component1' } },
        { spec: { namespace: 'remote' }, metadata: { name: 'component2' } },
      ]),
    });
    const uiSchema = {
      'ui:options': {
        path: '/test-endpoint',
        valueSelector: 'metadata.name',
        labelTemplate: '{{ item.spec.namespace }}:{{ item.metadata.name }}',
      },
    };
    const props = {
      uiSchema,
      formContext: { formData: {} },
    } as unknown as FieldExtensionComponentProps<string | string[]>;
    const { getByTestId, getByText } = await renderWithEffects(
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <SelectFieldFromApi {...props} />
        </TestApiProvider>,
      ),
    );
    const input = getByTestId('select');
    expect(input.textContent).toBe('Select from results');
    fireEvent.mouseDown(within(input).getByRole('button'));

    expect(getByText('main:component1')).toBeInTheDocument();
    expect(getByText('remote:component2')).toBeInTheDocument();
  });
});
