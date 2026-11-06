/*
 * Copyright 2026 Larder Software Limited
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
import { ScmIntegrations } from '@backstage/integration';
import { ConfigReader } from '@backstage/config';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { createCatalogRegisterMultipleAction } from './catalogRegisterMultiple';

describe('catalog:register-multiple', () => {
  const integrations = ScmIntegrations.fromConfig(
    new ConfigReader({
      integrations: {
        github: [{ host: 'github.com', token: 'token' }],
      },
    }),
  );

  const catalogUrl =
    'https://github.com/owner/repo/blob/main/catalog-info.yaml';
  const repoContentsUrl = 'https://github.com/owner/repo/tree/main';

  const componentEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'my-service', namespace: 'default' },
    spec: { type: 'service', lifecycle: 'production', owner: 'team-a' },
  };

  const apiEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'API',
    metadata: { name: 'my-api', namespace: 'default' },
    spec: {
      type: 'openapi',
      lifecycle: 'production',
      owner: 'team-a',
      definition: '{}',
    },
  };

  const generatedEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'generated-abc123', namespace: 'default' },
    spec: { type: 'service', lifecycle: 'production', owner: 'team-a' },
  };

  let catalog: jest.Mocked<CatalogService>;

  beforeEach(() => {
    catalog = {
      addLocation: jest.fn(),
    } as unknown as jest.Mocked<CatalogService>;
  });

  it('registers with catalogInfoUrl and returns all entity refs', async () => {
    catalog.addLocation
      .mockResolvedValueOnce({ location: {} as any, entities: [] })
      .mockResolvedValueOnce({
        location: {} as any,
        entities: [componentEntity, apiEntity],
      });

    const action = createCatalogRegisterMultipleAction({
      catalog,
      integrations,
    });
    const ctx = createMockActionContext({
      input: { catalogInfoUrl: catalogUrl },
    });

    await action.handler(ctx);

    expect(ctx.output).toHaveBeenCalledWith('entityRefs', [
      'component:default/my-service',
      'api:default/my-api',
    ]);
    expect(ctx.output).toHaveBeenCalledWith(
      'entityRef',
      'component:default/my-service',
    );
    expect(ctx.output).toHaveBeenCalledWith('catalogInfoUrl', catalogUrl);
  });

  it('resolves catalogInfoUrl from repoContentsUrl', async () => {
    catalog.addLocation
      .mockResolvedValueOnce({ location: {} as any, entities: [] })
      .mockResolvedValueOnce({
        location: {} as any,
        entities: [componentEntity],
      });

    const action = createCatalogRegisterMultipleAction({
      catalog,
      integrations,
    });
    const ctx = createMockActionContext({
      input: {
        repoContentsUrl,
        catalogInfoPath: '/catalog-info.yaml',
      },
    });

    await action.handler(ctx);

    const resolvedUrl = catalog.addLocation.mock.calls[0][0].target;
    expect(resolvedUrl).toContain('catalog-info.yaml');
    expect(ctx.output).toHaveBeenCalledWith(
      'entityRef',
      'component:default/my-service',
    );
  });

  it('resolves repoContentsUrl with default catalogInfoPath', async () => {
    catalog.addLocation
      .mockResolvedValueOnce({ location: {} as any, entities: [] })
      .mockResolvedValueOnce({
        location: {} as any,
        entities: [componentEntity],
      });

    const action = createCatalogRegisterMultipleAction({
      catalog,
      integrations,
    });
    const ctx = createMockActionContext({
      input: { repoContentsUrl },
    });

    await action.handler(ctx);

    const resolvedUrl = catalog.addLocation.mock.calls[0][0].target;
    expect(resolvedUrl).toContain('catalog-info.yaml');
  });

  it('swallows errors when optional is true', async () => {
    catalog.addLocation.mockRejectedValue(new Error('Not found'));

    const action = createCatalogRegisterMultipleAction({
      catalog,
      integrations,
    });
    const ctx = createMockActionContext({
      input: { catalogInfoUrl: catalogUrl, optional: true },
    });

    await expect(action.handler(ctx)).resolves.toBeUndefined();
    expect(ctx.output).toHaveBeenCalledWith('catalogInfoUrl', catalogUrl);
  });

  it('propagates errors when optional is false', async () => {
    catalog.addLocation.mockRejectedValue(new Error('Not found'));

    const action = createCatalogRegisterMultipleAction({
      catalog,
      integrations,
    });
    const ctx = createMockActionContext({
      input: { catalogInfoUrl: catalogUrl },
    });

    await expect(action.handler(ctx)).rejects.toThrow('Not found');
  });

  it('prefers non-generated Component as primary entity', async () => {
    catalog.addLocation
      .mockResolvedValueOnce({ location: {} as any, entities: [] })
      .mockResolvedValueOnce({
        location: {} as any,
        entities: [apiEntity, generatedEntity, componentEntity],
      });

    const action = createCatalogRegisterMultipleAction({
      catalog,
      integrations,
    });
    const ctx = createMockActionContext({
      input: { catalogInfoUrl: catalogUrl },
    });

    await action.handler(ctx);

    expect(ctx.output).toHaveBeenCalledWith(
      'entityRef',
      'component:default/my-service',
    );
    expect(ctx.output).toHaveBeenCalledWith('entityRefs', [
      'api:default/my-api',
      'component:default/generated-abc123',
      'component:default/my-service',
    ]);
  });

  it('falls back to non-generated entity when no Component exists', async () => {
    catalog.addLocation
      .mockResolvedValueOnce({ location: {} as any, entities: [] })
      .mockResolvedValueOnce({
        location: {} as any,
        entities: [generatedEntity, apiEntity],
      });

    const action = createCatalogRegisterMultipleAction({
      catalog,
      integrations,
    });
    const ctx = createMockActionContext({
      input: { catalogInfoUrl: catalogUrl },
    });

    await action.handler(ctx);

    expect(ctx.output).toHaveBeenCalledWith('entityRef', 'api:default/my-api');
  });

  it('falls back to first entity when all are generated', async () => {
    catalog.addLocation
      .mockResolvedValueOnce({ location: {} as any, entities: [] })
      .mockResolvedValueOnce({
        location: {} as any,
        entities: [generatedEntity],
      });

    const action = createCatalogRegisterMultipleAction({
      catalog,
      integrations,
    });
    const ctx = createMockActionContext({
      input: { catalogInfoUrl: catalogUrl },
    });

    await action.handler(ctx);

    expect(ctx.output).toHaveBeenCalledWith(
      'entityRef',
      'component:default/generated-abc123',
    );
  });

  it('throws InputError for unknown integration host', async () => {
    const action = createCatalogRegisterMultipleAction({
      catalog,
      integrations,
    });
    const ctx = createMockActionContext({
      input: { repoContentsUrl: 'https://unknown.example.com/repo' },
    });

    await expect(action.handler(ctx)).rejects.toThrow(
      'No integration found for host',
    );
  });
});
