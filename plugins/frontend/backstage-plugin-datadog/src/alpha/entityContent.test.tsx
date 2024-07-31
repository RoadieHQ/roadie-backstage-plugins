import { screen, waitFor } from '@testing-library/react';
import { createExtensionTester } from '@backstage/frontend-test-utils';
import { entityDatadogContent } from './entityContent';
import {
  createApiExtension,
  createApiFactory,
} from '@backstage/frontend-plugin-api';
import { DatadogApi, datadogApiRef } from '../api';
import { entityWithDatadogAnnotations } from '../mocks/mocks';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: () => entityWithDatadogAnnotations,
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useRouteRef: () => () => '/datadog',
}));

describe('Entity content extensions', () => {
  const mockDatadogApi = createApiExtension({
    factory: createApiFactory({
      api: datadogApiRef,
      deps: {},
      factory: () => ({} as unknown as DatadogApi),
    }),
  });

  it('should render the dashboard on an entity with the correct annotation', async () => {
    createExtensionTester(entityDatadogContent).add(mockDatadogApi).render();
    await waitFor(
      () => {
        expect(screen.getByTestId('Datadog dashboard 0')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
