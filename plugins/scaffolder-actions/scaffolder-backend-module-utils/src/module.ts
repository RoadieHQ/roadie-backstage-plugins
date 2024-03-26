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
import {
  createAppendFileAction,
  createParseFileAction,
  createReplaceInFileAction,
  createWriteFileAction,
} from './actions/fs';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import {
  createJSONataAction,
  createJsonJSONataTransformAction,
  createYamlJSONataTransformAction,
} from './actions/jsonata';
import { createMergeJSONAction } from './actions/merge';
import {
  createSerializeJsonAction,
  createSerializeYamlAction,
} from './actions/serialize';
import { createSleepAction } from './actions/sleep';
import { createZipAction } from './actions/zip';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';

export const scaffolderUtilsModule = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'roadie-utils',
  register(reg) {
    reg.registerInit({
      deps: {
        discovery: coreServices.discovery,
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(
          createWriteFileAction(),
          createAppendFileAction(),
          createParseFileAction(),
          createReplaceInFileAction(),
          createJsonJSONataTransformAction(),
          createJSONataAction(),
          createYamlJSONataTransformAction(),
          createMergeJSONAction({ actionId: 'roadiehq:utils:json:merge' }),
          createSerializeJsonAction(),
          createSerializeYamlAction(),
          createSleepAction(),
          createZipAction(),
        );
      },
    });
  },
});
