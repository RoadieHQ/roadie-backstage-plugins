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

import { AWSCatalogProcessor } from './AWSCatalogProcessor';
import {
  Entity,
  ResourceEntity,
  getCompoundEntityRef,
  RELATION_DEPENDS_ON,
  RELATION_DEPENDENCY_OF,
} from '@backstage/catalog-model';
import {
  CatalogProcessorEmit,
  LocationSpec,
  processingResult,
} from '@backstage/plugin-catalog-backend';
import { ANNOTATION_AWS_IAM_ROLE_ARN } from '../annotations';
import { Config } from '@backstage/config';
import * as winston from 'winston';
import { PluginEndpointDiscovery } from '@backstage/backend-common';
import { CatalogClient, CatalogApi } from '@backstage/catalog-client';
import { arnToName } from '../utils/arnToName';

export class AWSIAMRoleProcessor extends AWSCatalogProcessor {
  static fromConfig(
    _config: Config,
    options: { logger: winston.Logger; discovery: PluginEndpointDiscovery },
  ) {
    const catalogApi: CatalogApi = new CatalogClient({
      discoveryApi: options.discovery,
    });
    return new AWSIAMRoleProcessor({ catalogApi, ...options });
  }

  getProcessorName(): string {
    return 'aws-iam-role';
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    if (!this.validateEntityKind(entity)) {
      return entity;
    }

    const resource = entity as ResourceEntity;

    if (
      !(
        resource.metadata?.annotations &&
        Object.keys(resource.metadata?.annotations).includes(
          ANNOTATION_AWS_IAM_ROLE_ARN,
        )
      )
    ) {
      return resource;
    }

    const relatedEntities = await this.catalogApi.getEntities({
      filter: {
        'metadata.name': arnToName(
          resource.metadata.annotations[ANNOTATION_AWS_IAM_ROLE_ARN],
        ),
      },
    });

    relatedEntities.items.forEach(relatedEntity => {
      const thisEntityRef = getCompoundEntityRef(entity);
      const relatedEntityRef = getCompoundEntityRef(relatedEntity);

      if (thisEntityRef !== relatedEntityRef) {
        emit(
          processingResult.relation({
            type: RELATION_DEPENDS_ON,
            target: thisEntityRef,
            source: relatedEntityRef,
          }),
        );
        emit(
          processingResult.relation({
            type: RELATION_DEPENDENCY_OF,
            target: relatedEntityRef,
            source: thisEntityRef,
          }),
        );
      }
    });
    return resource;
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    if (!(entity.kind === 'Resource')) {
      return false;
    }
    const resource = entity as ResourceEntity;
    if (!(resource.spec.type === 'aws-role')) {
      return false;
    }
    if (
      !(
        resource.metadata?.annotations &&
        Object.keys(resource.metadata?.annotations).includes(
          ANNOTATION_AWS_IAM_ROLE_ARN,
        )
      )
    ) {
      return false;
    }
    // we've confirmed now that we are processing an AWS IAM Role resource entity
    return true;
  }
}
