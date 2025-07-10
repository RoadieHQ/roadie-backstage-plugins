/*
 * Copyright 2021 Larder Software Limited
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
import { Config } from '@backstage/config';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ArgoService } from '@roadiehq/backstage-plugin-argo-cd-backend';
import { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';

export const createArgoCdResources = (
  config: Config,
  logger: Logger | LoggerService,
) => {
  return createTemplateAction({
    id: 'argocd:create-resources',
    schema: {
      input: {
        appName: z =>
          z
            .string()
            .describe('The name of the app as it will show up in Argo CD'),
        argoInstance: z =>
          z.string().describe('The name of the Argo CD Instance to deploy to'),
        namespace: z =>
          z
            .string()
            .describe(
              'The namespace Argo CD will target for resource deployment',
            ),
        projectName: z =>
          z
            .string()
            .describe(
              'The name of the project as it will show up in Argo CD. By default we use the application name.',
            ),
        repoUrl: z =>
          z
            .string()
            .describe(
              'The Repo URL that will be programmed into the Argo CD project and application',
            ),
        path: z =>
          z
            .string()
            .describe(
              'The path of the resources Argo CD will watch in the repository mentioned',
            ),
        labelValue: z =>
          z
            .string()
            .describe(
              'The label Backstage will use to find applications in Argo CD',
            ),
      },
    },

    async handler(ctx) {
      const argoUserName =
        config.getOptionalString('argocd.username') ?? 'argocdUsername';
      const argoPassword =
        config.getOptionalString('argocd.password') ?? 'argocdPassword';

      const argoSvc = new ArgoService(
        argoUserName,
        argoPassword,
        config,
        logger,
      );

      await argoSvc.createArgoResources({
        argoInstance: ctx.input.argoInstance,
        appName: ctx.input.appName,
        projectName: ctx.input.projectName
          ? ctx.input.projectName
          : ctx.input.appName,
        namespace: ctx.input.namespace,
        sourceRepo: ctx.input.repoUrl,
        sourcePath: ctx.input.path,
        labelValue: ctx.input.labelValue
          ? ctx.input.labelValue
          : ctx.input.appName,
        logger,
      });
    },
  });
};
