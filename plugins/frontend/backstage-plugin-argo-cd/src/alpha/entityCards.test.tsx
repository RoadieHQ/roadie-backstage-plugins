import { screen, waitFor } from '@testing-library/react';
import {
  createExtensionTester,
  TestApiProvider,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import {
  entityArgoCDOverviewCard,
  entityArgoCDHistoryCard,
} from './entityCards';
import { ArgoCDApiClient, argoCDApiRef } from '../api';
import { getEntityStub } from '../mocks/mocks';
import { EntityProvider } from '@backstage/plugin-catalog-react';

describe('Entity cards extensions', () => {
  const mockArgocdApi = {} as unknown as ArgoCDApiClient;
  const mockedEntity = getEntityStub;

  it('should render the overview card on an entity', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[argoCDApiRef, mockArgocdApi]]}>
        <EntityProvider entity={mockedEntity}>
          {createExtensionTester(entityArgoCDOverviewCard).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('ArgoCD overview')).toBeInTheDocument();
    });
  });

  it('should render the history card on an entity', async () => {
    renderInTestApp(
      <TestApiProvider apis={[[argoCDApiRef, mockArgocdApi]]}>
        <EntityProvider entity={mockedEntity}>
          {createExtensionTester(entityArgoCDHistoryCard).reactElement()}
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('ArgoCD history')).toBeInTheDocument();
    });
  });
});
