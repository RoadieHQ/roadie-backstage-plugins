import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/frontend-test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { entityDatadogContent } from './entityContent';
import { DatadogApi, datadogApiRef } from '../api';
import {
  entityWithDatadogAnnotations,
  entityWithReferrerPolicyAnnotation,
} from '../mocks/mocks';
import { DatadogDashboardPage } from '../components/DatadogDashboardPage';

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

  it('should apply referrerPolicy from entity annotation to the iframe', async () => {
    renderInTestApp(
      <DatadogDashboardPage
        entity={entityWithReferrerPolicyAnnotation.entity}
      />,
    );
    await waitFor(() => {
      const iframe = screen.getByTitle('dashboard');
      expect(iframe).toHaveAttribute(
        'referrerpolicy',
        'strict-origin-when-cross-origin',
      );
    });
  });
});
