import { screen, waitFor } from '@testing-library/react';
import { createExtensionTester } from '@backstage/frontend-test-utils';
import {
  entityArgoCDOverviewCard,
  entityArgoCDHistoryCard,
} from './entityCards';
import {
  createApiExtension,
  createApiFactory,
} from '@backstage/frontend-plugin-api';
import { ArgoCDApiClient, argoCDApiRef } from '../api';
import { getEntityStub } from '../mocks/mocks';

jest.mock('@backstage/plugin-catalog-react', () => ({
  ...jest.requireActual('@backstage/plugin-catalog-react'),
  useEntity: () => ({ entity: getEntityStub }),
}));

describe('Entity cards extensions', () => {
  const mockArgocdApi = createApiExtension({
    factory: createApiFactory({
      api: argoCDApiRef,
      deps: {},
      factory: () => ({} as unknown as ArgoCDApiClient),
    }),
  });

  it('should render the overview card on an entity', async () => {
    createExtensionTester(entityArgoCDOverviewCard).add(mockArgocdApi).render();
    await waitFor(() => {
      expect(screen.getByText('ArgoCD overview')).toBeInTheDocument();
    });
  });

  it('should render the history card on an entity', async () => {
    createExtensionTester(entityArgoCDHistoryCard).add(mockArgocdApi).render();
    await waitFor(() => {
      expect(screen.getByText('ArgoCD history')).toBeInTheDocument();
    });
  });
});
