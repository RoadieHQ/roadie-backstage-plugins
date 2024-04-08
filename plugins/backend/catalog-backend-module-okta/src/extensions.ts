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
import { createExtensionPoint } from '@backstage/backend-plugin-api';
import { OktaEntityProvider } from './providers/OktaEntityProvider';
import { OktaUserEntityTransformer } from './providers/types';
import { Config } from '@backstage/config';

export type EntityProviderFactory = (oktaConfig: Config) => OktaEntityProvider;

export interface OktaCatalogBackendEntityProviderFactoryExtensionPoint {
  setEntityProviderFactory(factory: EntityProviderFactory): void;
}

export const oktaCatalogBackendEntityProviderFactoryExtensionPoint =
  createExtensionPoint<OktaCatalogBackendEntityProviderFactoryExtensionPoint>({
    id: 'catalog.okta-entity-provider.entity-provider-factory',
  });

export interface OktaCatalogBackendUserTransformerExtensionPoint {
  setUserTransformer(transformer: OktaUserEntityTransformer): void;
}

export const oktaCatalogBackendUserTransformerExtensionPoint =
  createExtensionPoint<OktaCatalogBackendUserTransformerExtensionPoint>({
    id: 'catalog.okta-entity-provider.user-transformer',
  });
