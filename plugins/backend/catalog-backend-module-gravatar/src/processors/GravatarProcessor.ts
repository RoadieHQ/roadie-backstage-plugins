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
import crypto from 'crypto';
import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import { Entity, isUserEntity } from '@backstage/catalog-model';

export class GravatarProcessor implements CatalogProcessor {
  getProcessorName() {
    return 'GravatarProcessor';
  }

  async preProcessEntity(entity: Entity) {
    if (isUserEntity(entity) && entity.spec?.profile?.email) {
      const email = entity.spec.profile.email.trim().toLowerCase();
      const hash = crypto.createHash('md5').update(email).digest('hex');
      const gravatarUrl = `https://www.gravatar.com/avatar/${hash}`;

      entity.spec.profile.picture = gravatarUrl;
    }

    return entity;
  }
}
