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
import { InputError } from '@backstage/errors';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ScmIntegrationRegistry } from '@backstage/integration';
import { CatalogService } from '@backstage/plugin-catalog-node';

export function createCatalogRegisterMultipleAction(options: {
  catalog: CatalogService;
  integrations: ScmIntegrationRegistry;
}) {
  const { catalog, integrations } = options;

  return createTemplateAction({
    id: 'catalog:register-multiple',
    description:
      'Registers entities from a catalog descriptor file in the software catalog and outputs all entity references.',
    schema: {
      input: {
        catalogInfoUrl: z =>
          z
            .string()
            .describe(
              'An absolute URL pointing to the catalog info file location',
            )
            .optional(),
        repoContentsUrl: z =>
          z
            .string()
            .describe(
              'An absolute URL pointing to the root of a repository directory tree',
            )
            .optional(),
        catalogInfoPath: z =>
          z
            .string()
            .describe(
              'A relative path from the repo root pointing to the catalog info file, defaults to /catalog-info.yaml',
            )
            .optional(),
        optional: z =>
          z
            .boolean()
            .describe(
              'Permit the registered location to optionally exist. Default: false',
            )
            .optional(),
      },
      output: {
        entityRefs: z =>
          z
            .array(z.string())
            .describe('The entity references of all registered entities'),
        entityRef: z =>
          z
            .string()
            .describe('The entity reference of the primary registered entity'),
        catalogInfoUrl: z =>
          z
            .string()
            .describe('The URL of the catalog info file that was registered'),
      },
    },
    async handler(ctx) {
      const { input } = ctx;

      let catalogInfoUrl: string;
      if (input.catalogInfoUrl) {
        catalogInfoUrl = input.catalogInfoUrl;
      } else if (input.repoContentsUrl) {
        const catalogInfoPath = input.catalogInfoPath ?? '/catalog-info.yaml';
        const integration = integrations.byUrl(input.repoContentsUrl);
        if (!integration) {
          throw new InputError(
            `No integration found for host ${input.repoContentsUrl}`,
          );
        }
        catalogInfoUrl = integration.resolveUrl({
          base: input.repoContentsUrl,
          url: catalogInfoPath,
        });
      } else {
        throw new InputError(
          'Either catalogInfoUrl or repoContentsUrl must be provided',
        );
      }

      ctx.logger.info(`Registering ${catalogInfoUrl} in the catalog`);

      try {
        await catalog.addLocation(
          { type: 'url', target: catalogInfoUrl },
          { credentials: await ctx.getInitiatorCredentials() },
        );
      } catch (e) {
        if (!input.optional) {
          throw e;
        }
      }

      try {
        const result = await catalog.addLocation(
          { dryRun: true, type: 'url', target: catalogInfoUrl },
          { credentials: await ctx.getInitiatorCredentials() },
        );

        if (result.entities.length) {
          const { entities } = result;

          ctx.output(
            'entityRefs',
            entities.map(entity => stringifyEntityRef(entity)),
          );

          let primary = entities.find(
            e =>
              !e.metadata.name.startsWith('generated-') &&
              e.kind === 'Component',
          );
          if (!primary) {
            primary = entities.find(
              e => !e.metadata.name.startsWith('generated-'),
            );
          }
          if (!primary) {
            primary = entities[0];
          }
          ctx.output('entityRef', stringifyEntityRef(primary));
        }
      } catch (e) {
        if (!input.optional) {
          throw e;
        }
      }

      ctx.output('catalogInfoUrl', catalogInfoUrl);
    },
  });
}
