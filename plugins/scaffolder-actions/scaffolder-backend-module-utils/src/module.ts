/*
 * Copyright 2024 Larder Software Limited
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
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import {
  DefaultGithubCredentialsProvider,
  ScmIntegrations,
} from '@backstage/integration';
import * as backendModuleUtils from './actions';

/**
 * @public
 * The Roadie Module for the Scaffolder Backend
 */
export const scaffolderBackendModuleUtils = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'scaffolder-backend-module-utils',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        reader: coreServices.urlReader,
        catalog: catalogServiceRef,
      },
      async init({ scaffolder, config, logger, reader, catalog }) {
        const integrations = ScmIntegrations.fromConfig(config);
        const githubCredentialsProvider =
          DefaultGithubCredentialsProvider.fromIntegrations(integrations);

        scaffolder.addActions(
          backendModuleUtils.createAppendFileAction(),
          backendModuleUtils.createJSONataAction(),
          backendModuleUtils.createJsonJSONataTransformAction(),
          backendModuleUtils.createMergeAction(),
          backendModuleUtils.createMergeJSONAction({}),
          backendModuleUtils.createParseFileAction(),
          backendModuleUtils.createReplaceInFileAction(),
          backendModuleUtils.createSerializeJsonAction(),
          backendModuleUtils.createSerializeYamlAction(),
          backendModuleUtils.createSleepAction(),
          backendModuleUtils.createWriteFileAction(),
          backendModuleUtils.createYamlJSONataTransformAction(),
          backendModuleUtils.createZipAction(),
          backendModuleUtils.createFilesystemAppendAction(),
          backendModuleUtils.createFilesystemExistsAction(),
          backendModuleUtils.createReadFileAction(),
          backendModuleUtils.createWorkspaceTemplateAction({ integrations }),
          backendModuleUtils.createWorkspaceTemplateFileAction({
            integrations,
          }),
          backendModuleUtils.createFetchTemplateDebugAction({
            reader,
            integrations,
          }),
          backendModuleUtils.createFetchTemplatePlusAction({
            reader,
            integrations,
          }),
          backendModuleUtils.createCatalogRegisterMultipleAction({
            catalog,
            integrations,
          }),
          backendModuleUtils.createGitlabRepoCommitAction({ integrations }),
          backendModuleUtils.createGitlabRepoProtectAction({ integrations }),
          backendModuleUtils.createPublishGithubPullRequestDebugAction({
            integrations,
            githubCredentialsProvider,
            config,
            logger,
          }),
        );
      },
    });
  },
});
