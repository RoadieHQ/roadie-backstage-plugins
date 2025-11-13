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
import { type Entity } from '@backstage/catalog-model';
import yaml from 'js-yaml';
import { compile, Environment, type Template } from 'nunjucks';

import { arnToName } from '../arnToName';
import { dateToIso } from '../dateToIso';
import { sanitizeName, sanitizeNameDashesOnly } from '../sanitizeName';
import {
  labelsFromTags,
  type LabelValueMapper,
  ownerFromTags,
  relationshipsFromTags,
  type Tag,
} from '../tags';

import { BaseTemplateLoader } from './BaseTemplateLoader';

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

/**
 * Context for rendering a cloud resource into a Backstage entity.
 *
 * @template CloudResource - The AWS SDK resource type (e.g., DBInstance, FunctionConfiguration)
 * @template AdditionalData - Optional additional data structure for template context (e.g., parent resource data)
 */
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

/**
 * Wrapper to hold instance reference for late-binding in filters
 */
class InstanceRef<T> {
  instance?: CloudResourceTemplate<T>;
}

/**
 * CloudResourceTemplate class for rendering cloud resources into Backstage entities using Nunjucks templates.
 *
 * @template CloudResource - The AWS SDK resource type (e.g., DBInstance, FunctionConfiguration)
 */
export class CloudResourceTemplate<CloudResource = any> {
  private readonly template: Template;
  private readonly config: CloudResourceTemplateConfig<CloudResource>;
  private readonly instanceRef: InstanceRef<CloudResource>;

  /**
   * Private constructor. Use `fromConfig` to create instances.
   */
  private constructor(
    config: CloudResourceTemplateConfig<CloudResource>,
    precompiledTemplate?: Template,
    instanceRef?: InstanceRef<CloudResource>,
  ) {
    this.config = config;
    this.instanceRef = instanceRef ?? new InstanceRef<CloudResource>();
    this.instanceRef.instance = this;
    this.template = precompiledTemplate ?? this.compileTemplate(config);
  }

  /**
   * Create a CloudResourceTemplate instance from configuration.
   *
   * @param config - Template configuration
   * @returns A new CloudResourceTemplate instance
   */
  static fromConfig<CloudResource = any>(
    config: CloudResourceTemplateConfig<CloudResource>,
  ): CloudResourceTemplate<CloudResource> {
    return new CloudResourceTemplate<CloudResource>(config);
  }

  /**
   * Create a child instance with additional or overridden configuration.
   * This is useful when processing resources from multiple regions or accounts
   * with the same base template.
   *
   * The child reuses the parent's compiled template for performance, since
   * only the template string and custom filters are compiled, while config
   * values like groups are read at filter execution time.
   *
   * @param config - Partial configuration to merge with parent config
   * @returns A new CloudResourceTemplate instance with the same generic type
   */
  child(
    config: Omit<
      Partial<CloudResourceTemplateConfig<CloudResource>>,
      'ownerTagKey' | 'labelValueMapper' | 'getResourceAnnotations'
    >,
  ): CloudResourceTemplate<CloudResource> {
    return new CloudResourceTemplate<CloudResource>(
      {
        ...this.config,
        ...config,
      },
      this.template, // Reuse pre-compiled template
      this.instanceRef, // Share instanceRef - render() will update it before each use
    );
  }

  /**
   * Render a cloud resource into a Backstage entity using the template.
   *
   * @template AdditionalData - Optional additional data structure for template context
   * @param renderContext - The render context containing cloud resource data and annotations
   * @returns Promise resolving to a Backstage Entity
   */
  async render<AdditionalData = Record<string, any>>(
    renderContext: RenderContext<CloudResource, AdditionalData>,
  ): Promise<Entity> {
    try {
      // Update instanceRef to point to current instance before rendering
      this.instanceRef.instance = this;

      // Get resource-specific annotations from config if provided
      let configResourceAnnotations: Record<string, string> = {};
      if (this.config.getResourceAnnotations) {
        const annotationContext = {
          accountId: this.config.accountId,
          region: this.config.region,
        };
        configResourceAnnotations = await Promise.resolve(
          this.config.getResourceAnnotations(
            renderContext.data,
            annotationContext,
          ),
        );
      }

      // Pre-merge annotations with precedence: config > context > default
      const mergedAnnotations = {
        ...(this.config.defaultAnnotations || {}),
        ...(renderContext.resourceAnnotations || {}),
        ...configResourceAnnotations,
      };

      let tagMap: Record<string, string>;
      if (Array.isArray(renderContext.tags)) {
        tagMap = renderContext.tags.reduce((acc, tag) => {
          if (tag.Key && tag.Value) {
            acc[tag.Key] = tag.Value;
          }
          return acc;
        }, {} as Record<string, string>);
      } else {
        tagMap = renderContext.tags || {};
      }

      const context = {
        data: renderContext.data,
        tags: tagMap,
        mergedAnnotations,
        accountId: this.config.accountId,
        region: this.config.region,
        additionalData: renderContext.additionalData,
      };

      return new Promise((resolve, reject) => {
        this.template.render(context, (err, output) => {
          if (err) {
            return reject(
              new Error(`Template rendering failed: ${err.message}`),
            );
          }

          if (!output) {
            return reject(new Error('Template rendering produced no output'));
          }

          try {
            const entity = yaml.load(output) as Entity;

            // Merge mergedAnnotations into entity metadata
            // (template-defined annotations take precedence)
            entity.metadata.annotations = {
              ...mergedAnnotations,
              ...entity.metadata.annotations,
            };

            return resolve(entity);
          } catch (parseError: any) {
            return reject(
              new Error(`Failed to parse YAML output: ${parseError.message}`),
            );
          }
        });
      });
    } catch (error: any) {
      throw new Error(`Failed to get resource annotations: ${error.message}`);
    }
  }

  /**
   * Compile the Nunjucks template with custom filters.
   */
  private compileTemplate(config: CloudResourceTemplateConfig): Template {
    const env = new Environment(new BaseTemplateLoader(), {
      autoescape: false,
      throwOnUndefined: false,
    });

    // Filter: arn_to_name - Convert ARN to valid Backstage name using SHA256
    env.addFilter('arn_to_name', arnToName);

    // Filter: date_to_iso - Convert date (or date string or timestamp) to ISO string
    env.addFilter('date_to_iso', dateToIso);

    /**
     * @deprecated use 'arn_to_name' instead
     */
    env.addFilter('to_entity_name', arnToName);

    // Filter: sanitize_name - Convert string to valid Backstage name
    env.addFilter('sanitize_name', sanitizeName);

    // Filter: sanitize_name_dashes_only - Convert string to valid Backstage name, replacing all invalid chars with dashes
    env.addFilter('sanitize_name_dashes_only', sanitizeNameDashesOnly);

    // Filter: labels_from_tags - Convert tags to Backstage labels
    // Reads config from instance ref for late-binding (allows child overrides)
    env.addFilter(
      'labels_from_tags',
      (tags: Tag[] | Record<string, string>) => {
        return labelsFromTags(
          tags,
          this.instanceRef.instance?.config.labelValueMapper,
        );
      },
    );

    // Filter: owner_from_tags - Extract owner from tags with group validation (ASYNC)
    // Reads config from instance ref for late-binding (allows child overrides)
    env.addFilter(
      'owner_from_tags',
      (
        tags: Tag[] | Record<string, string>,
        callback: (err: any, result?: string) => void,
      ) => {
        try {
          const currentConfig = this.instanceRef.instance?.config;
          const ownerTagKey = currentConfig?.ownerTagKey ?? 'owner';
          const owner = ownerFromTags(tags, ownerTagKey, currentConfig?.groups);
          callback(null, owner);
        } catch (error: any) {
          callback(error);
        }
      },
      true, // Mark as async filter
    );

    // Filter: relationships_from_tags - Extract relationships from tags
    env.addFilter(
      'relationships_from_tags',
      (tags: Record<string, string | string[]>) => {
        return relationshipsFromTags(tags);
      },
    );

    env.addFilter('split', function splitFilter(str, delimiter) {
      return str.split(delimiter);
    });

    // Allow provider to add custom filters
    if (config.addCustomFilters) {
      config.addCustomFilters(env);
    }

    return compile(config.templateString, env);
  }
}
