import { screen, waitFor } from '@testing-library/react';
import { createExtensionTester } from '@backstage/frontend-test-utils';
import { entityDatadogGraphCard } from './entityCards';
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

describe('Entity content extensions', () => {
  const mockDatadogApi = createApiExtension({
    factory: createApiFactory({
      api: datadogApiRef,
      deps: {},
      factory: () => ({} as unknown as DatadogApi),
    }),
  });

  it('should render the graph card on an entity with the correct annotation', async () => {
    createExtensionTester(entityDatadogGraphCard).add(mockDatadogApi).render();
    await waitFor(
      () => {
        expect(screen.getByText('Datadog Graph')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
