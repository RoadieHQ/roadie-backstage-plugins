import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { entityDatadogContent } from './entityContent';
import { DatadogApi, datadogApiRef } from '../api';
import { entityWithDatadogAnnotations } from '../mocks/mocks';

describe('Entity content extensions', () => {
  const mockDatadogApi = {
    api: datadogApiRef,
    deps: {},
    factory: () => ({} as unknown as DatadogApi),
  };

  it('should render the dashboard on an entity with the correct annotation', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[datadogApiRef, mockDatadogApi]]}>
        <EntityProvider entity={entityWithDatadogAnnotations.entity}>
          {createExtensionTester(entityDatadogContent).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );
    await waitFor(
      () => {
        expect(screen.getByTestId('Datadog dashboard 0')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
