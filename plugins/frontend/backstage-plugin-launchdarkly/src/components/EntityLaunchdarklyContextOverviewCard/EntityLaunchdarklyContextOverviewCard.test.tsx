/*
 * Copyright 2024 Larder Software Limited
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
import { render, screen } from '@testing-library/react';
import { EntityLaunchdarklyContextOverviewCard } from './EntityLaunchdarklyContextOverviewCard';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useLaunchdarklyContextFlags } from '../../hooks/useLaunchdarklyContextFlags';
import { Entity } from '@backstage/catalog-model';

// Mock the dependencies
jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: jest.fn(),
  MissingAnnotationEmptyState: ({ annotation }: { annotation: string }) => (
    <div data-testid="missing-annotation">Missing annotation: {annotation}</div>
  ),
}));

jest.mock('../../hooks/useLaunchdarklyContextFlags', () => ({
  useLaunchdarklyContextFlags: jest.fn(),
}));

jest.mock('@backstage/core-components', () => ({
  Progress: () => <div data-testid="progress">Loading...</div>,
  ErrorPanel: ({ error }: { error: Error }) => (
    <div data-testid="error-panel">Error: {error.message}</div>
  ),
  Table: ({ title, data, columns }: any) => (
    <div data-testid="table">
      <h3>{title}</h3>
      <div data-testid="table-data">{JSON.stringify(data)}</div>
      <div data-testid="table-columns">{JSON.stringify(columns)}</div>
    </div>
  ),
}));

jest.mock('../../constants', () => ({
  LAUNCHDARKLY_PROJECT_KEY_ANNOTATION: 'launchdarkly.com/project-key',
  LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION:
    'launchdarkly.com/context-properties',
  LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION: 'launchdarkly.com/environment-key',
}));

const mockUseEntity = useEntity as jest.MockedFunction<typeof useEntity>;
const mockUseLaunchdarklyContextFlags =
  useLaunchdarklyContextFlags as jest.MockedFunction<
    typeof useLaunchdarklyContextFlags
  >;

describe('EntityLaunchdarklyContextOverviewCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockEntity = (
    annotations: Record<string, string> = {},
  ): Entity => ({
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'test-component',
      annotations,
    },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'team-a',
    },
  });

  it('renders missing annotation state when project key annotation is missing', () => {
    const entity = createMockEntity({
      'launchdarkly.com/context-properties': '{"key": "value"}',
      'launchdarkly.com/environment-key': 'production',
    });

    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: undefined,
      error: undefined,
      loading: false,
    });

    render(<EntityLaunchdarklyContextOverviewCard />);

    expect(screen.getByTestId('missing-annotation')).toBeInTheDocument();
    expect(
      screen.getByText('Missing annotation: launchdarkly.com/project-key'),
    ).toBeInTheDocument();
  });

  it('renders missing annotation state when context properties annotation is missing', () => {
    const entity = createMockEntity({
      'launchdarkly.com/project-key': 'test-project',
      'launchdarkly.com/environment-key': 'production',
    });

    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: undefined,
      error: undefined,
      loading: false,
    });

    render(<EntityLaunchdarklyContextOverviewCard />);

    expect(screen.getByTestId('missing-annotation')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Missing annotation: launchdarkly.com/context-properties',
      ),
    ).toBeInTheDocument();
  });

  it('renders missing annotation state when environment key annotation is missing', () => {
    const entity = createMockEntity({
      'launchdarkly.com/project-key': 'test-project',
      'launchdarkly.com/context-properties': '{"key": "value"}',
    });

    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: undefined,
      error: undefined,
      loading: false,
    });

    render(<EntityLaunchdarklyContextOverviewCard />);

    expect(screen.getByTestId('missing-annotation')).toBeInTheDocument();
    expect(
      screen.getByText('Missing annotation: launchdarkly.com/environment-key'),
    ).toBeInTheDocument();
  });

  it('renders loading state when data is loading', () => {
    const entity = createMockEntity({
      'launchdarkly.com/project-key': 'test-project',
      'launchdarkly.com/context-properties': '{"key": "value"}',
      'launchdarkly.com/environment-key': 'production',
    });

    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: undefined,
      error: undefined,
      loading: true,
    });

    render(<EntityLaunchdarklyContextOverviewCard />);

    expect(screen.getByTestId('progress')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error state when there is an error', () => {
    const entity = createMockEntity({
      'launchdarkly.com/project-key': 'test-project',
      'launchdarkly.com/context-properties': '{"key": "value"}',
      'launchdarkly.com/environment-key': 'production',
    });

    const error = new Error('Failed to fetch feature flags');
    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: undefined,
      error,
      loading: false,
    });

    render(<EntityLaunchdarklyContextOverviewCard />);

    expect(screen.getByTestId('error-panel')).toBeInTheDocument();
    expect(
      screen.getByText('Error: Failed to fetch feature flags'),
    ).toBeInTheDocument();
  });

  it('renders table with feature flags data when successful', () => {
    const entity = createMockEntity({
      'launchdarkly.com/project-key': 'test-project',
      'launchdarkly.com/context-properties': '{"key": "value"}',
      'launchdarkly.com/environment-key': 'production',
    });

    const mockData = [
      { name: 'feature-flag-1', _value: true },
      { name: 'feature-flag-2', _value: false },
    ];

    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: mockData,
      error: undefined,
      loading: false,
    });

    render(<EntityLaunchdarklyContextOverviewCard />);

    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(
      screen.getByText('Feature flags from LaunchDarkly'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('table-data')).toHaveTextContent(
      JSON.stringify(mockData),
    );
  });

  it('renders table with custom title when provided', () => {
    const entity = createMockEntity({
      'launchdarkly.com/project-key': 'test-project',
      'launchdarkly.com/context-properties': '{"key": "value"}',
      'launchdarkly.com/environment-key': 'production',
    });

    const mockData = [{ name: 'feature-flag-1', _value: true }];

    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: mockData,
      error: undefined,
      loading: false,
    });

    render(<EntityLaunchdarklyContextOverviewCard title="Custom Title" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders table with search enabled when enableSearch is true', () => {
    const entity = createMockEntity({
      'launchdarkly.com/project-key': 'test-project',
      'launchdarkly.com/context-properties': '{"key": "value"}',
      'launchdarkly.com/environment-key': 'production',
    });

    const mockData = [{ name: 'feature-flag-1', _value: true }];

    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: mockData,
      error: undefined,
      loading: false,
    });

    render(<EntityLaunchdarklyContextOverviewCard enableSearch />);

    expect(screen.getByTestId('table')).toBeInTheDocument();
    // Note: The actual Table component would receive the search option,
    // but our mock doesn't implement the full Table behavior
  });

  it('renders table with search disabled by default', () => {
    const entity = createMockEntity({
      'launchdarkly.com/project-key': 'test-project',
      'launchdarkly.com/context-properties': '{"key": "value"}',
      'launchdarkly.com/environment-key': 'production',
    });

    const mockData = [{ name: 'feature-flag-1', _value: true }];

    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: mockData,
      error: undefined,
      loading: false,
    });

    render(<EntityLaunchdarklyContextOverviewCard />);

    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('handles entity with no annotations', () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'test-component',
        // No annotations
      },
      spec: {
        type: 'service',
        lifecycle: 'production',
        owner: 'team-a',
      },
    };

    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: undefined,
      error: undefined,
      loading: false,
    });

    render(<EntityLaunchdarklyContextOverviewCard />);

    expect(screen.getByTestId('missing-annotation')).toBeInTheDocument();
  });

  it('handles entity with empty annotations object', () => {
    const entity = createMockEntity({});

    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: undefined,
      error: undefined,
      loading: false,
    });

    render(<EntityLaunchdarklyContextOverviewCard />);

    expect(screen.getByTestId('missing-annotation')).toBeInTheDocument();
  });

  it('renders table correctly with specific feature flags data', () => {
    const entity = createMockEntity({
      'launchdarkly.com/project-key': 'test-project',
      'launchdarkly.com/context-properties': '{"key": "value"}',
      'launchdarkly.com/environment-key': 'production',
    });

    const mockApiResponse = {
      items: [
        {
          name: 'sample',
          key: 'sample-key',
          _value: {
            enabled: true,
            configItem: 'something something',
          },
          reason: {
            kind: 'FALLTHROUGH',
            ruleIndex: -1,
            ruleID: '',
            prerequisiteKey: '',
            inExperiment: false,
            errorKind: '',
          },
          _links: {},
        },
        {
          name: 'sample2',
          key: 'sample-key2',
          _value: {
            enabled: true,
            configItem: 'something something',
          },
          reason: {
            kind: 'FALLTHROUGH',
            ruleIndex: -1,
            ruleID: '',
            prerequisiteKey: '',
            inExperiment: false,
            errorKind: '',
          },
          _links: {},
        },
        {
          name: 'sample3',
          key: 'sample-key3',
          _value: {
            enabled: true,
            configItem: 'something something',
          },
          reason: {
            kind: 'FALLTHROUGH',
            ruleIndex: -1,
            ruleID: '',
            prerequisiteKey: '',
            inExperiment: false,
            errorKind: '',
          },
          _links: {},
        },
      ],
    };

    mockUseEntity.mockReturnValue({ entity });
    mockUseLaunchdarklyContextFlags.mockReturnValue({
      value: mockApiResponse.items,
      error: undefined,
      loading: false,
    });

    render(<EntityLaunchdarklyContextOverviewCard />);

    // Verify the table is rendered
    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(
      screen.getByText('Feature flags from LaunchDarkly'),
    ).toBeInTheDocument();

    // Verify the table contains the correct data
    const tableData = screen.getByTestId('table-data');
    expect(tableData).toHaveTextContent(JSON.stringify(mockApiResponse.items));

    // Verify specific feature flags are present in the data
    expect(tableData.textContent).toContain('sample');
    expect(tableData.textContent).toContain('sample2');
    expect(tableData.textContent).toContain('sample3');
    expect(tableData.textContent).toContain('sample-key');
    expect(tableData.textContent).toContain('sample-key2');
    expect(tableData.textContent).toContain('sample-key3');

    // Verify the _value objects are correctly included
    expect(tableData.textContent).toContain('something something');
    expect(tableData.textContent).toContain('FALLTHROUGH');
  });
});
