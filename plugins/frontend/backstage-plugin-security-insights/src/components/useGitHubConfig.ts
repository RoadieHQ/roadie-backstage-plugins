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


import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { Entity, getEntitySourceLocation } from "@backstage/catalog-model";

export const useGitHubConfig = (entity: Entity) => {
    const config = useApi(configApiRef);
    const providerConfigs = config.getOptionalConfigArray('integrations.github') ?? [];

    const location = getEntitySourceLocation(entity);

    if (location.type === 'url' && location.target.length > 0) {
        // Try to match a provider config with catalog location (being a github.com or github enterprise domain)
        const locationHost = new URL(location.target).host;
        return providerConfigs.find(providerConfig => providerConfig?.getOptionalString("host") === locationHost);
    }
    return providerConfigs[0];
}
