import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { entityDatadogGraphCard } from './entityCards';
import { DatadogApi, datadogApiRef } from '../api';
import { entityWithDatadogAnnotations } from '../mocks/mocks';

describe('Entity content extensions', () => {
  const mockDatadogApi = {
    api: datadogApiRef,
    deps: {},
    factory: () => ({} as unknown as DatadogApi),
  };

  it('should render the graph card on an entity with the correct annotation', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[datadogApiRef, mockDatadogApi]]}>
        <EntityProvider entity={entityWithDatadogAnnotations.entity}>
          {createExtensionTester(entityDatadogGraphCard).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );
    await waitFor(
      () => {
        expect(screen.getByText('Datadog Graph')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
