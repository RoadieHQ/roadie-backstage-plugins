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
import type { Entity } from '@backstage/catalog-model';
import type { Environment } from 'nunjucks';

import type { LabelValueMapper, Tag } from '../tags';
/**
 * Configuration for CloudResourceTemplate.
 *
 * This "template class" will be initialized on a per-cloud-resource-type basis, e.g. one for Lambda functions, one
 * for DynamoDB tables, etc. On a regular interval, the consumer of this class will fetch a new batch of resources and
 * `render` will be called for each resource.
 */
export interface CloudResourceTemplateConfig<CloudResource = any> {
  /** The Nunjucks template string that will be compiled */
  templateString: string;

  /** AWS Account ID to be available in template context */
  accountId: string;

  /** AWS Region to be available in template context */
  region: string;

  /** AWS Role ARN to be available in template context */
  roleArn?: string;

  /** List of Backstage Group entities for owner validation */
  groups?: Entity[];

  /** Tag key to use for extracting owner (default: 'owner') */
  ownerTagKey?: string;

  /** Custom mapper function for label values */
  labelValueMapper?: LabelValueMapper;

  /** Default annotations to be merged with resource-specific annotations */
  defaultAnnotations?: Record<string, string>;

  /** Function to get resource-specific annotations from the cloud resource */
  getResourceAnnotations?: (
    resource: CloudResource,
    context: { accountId: string; region: string },
  ) => Record<string, string> | Promise<Record<string, string>>;

  /** Function to add custom Nunjucks filters to the template environment */
  addCustomFilters?: (env: Environment) => void;
}

export type CloudResourceTemplatePrecompiledConfig<CloudResource = any> = Omit<
  CloudResourceTemplateConfig<CloudResource>,
  'templateString'
> & {
  templateString?: string;
};

export type CloudResourceTemplateChildConfig<CloudResource = any> = Omit<
  Partial<CloudResourceTemplateConfig<CloudResource>>,
  'ownerTagKey' | 'labelValueMapper' | 'getResourceAnnotations'
>;

// /**
//  * Context for rendering a cloud resource into a Backstage entity.
//  *
//  * @template CloudResource - The AWS SDK resource type (e.g., DBInstance, FunctionConfiguration)
//  * @template AdditionalData - Optional additional data structure for template context (e.g., parent resource data)
//  */
export interface RenderContext<
  CloudResource = any,
  AdditionalData = Record<string, any>,
> {
  /** The raw cloud resource data from AWS SDK */
  data: CloudResource;

  /** Tags associated with the resource (array or object format) */
  tags?: Tag[] | Record<string, string>;

  /** Resource-specific annotations to be merged with default annotations */
  resourceAnnotations?: Record<string, string>;

  /** Optional additional data to be made available in the template context */
  additionalData?: AdditionalData;
}
