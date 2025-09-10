/*
 * Copyright 2025 Larder Software Limited
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

import { convertLegacyRouteRefs } from '@backstage/core-compat-api';
import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { githubInsightsApi } from './apis';
import {
  githubInsightsComplianceEntityCard,
  githubInsightsContributorsEntityCard,
  githubInsightsLanguagesEntityCard,
  githubInsightsReadmeEntityCard,
  githubInsightsReleasesEntityCard,
  githubInsightsEnvironmentsEntityCard,
} from './entityCards';
import { githubInsightsEntityContent } from './entityContents';
import { rootRouteRef } from '../routes';

/**
 * @alpha
 */
export const githubInsightsPlugin = createFrontendPlugin({
  pluginId: 'github-insights',
  info: { packageJson: () => import('../../package.json') },
  extensions: [
    githubInsightsApi,
    githubInsightsComplianceEntityCard,
    githubInsightsContributorsEntityCard,
    githubInsightsLanguagesEntityCard,
    githubInsightsReadmeEntityCard,
    githubInsightsReleasesEntityCard,
    githubInsightsEnvironmentsEntityCard,
    githubInsightsEntityContent,
  ],
  routes: convertLegacyRouteRefs({
    root: rootRouteRef,
  }),
});
