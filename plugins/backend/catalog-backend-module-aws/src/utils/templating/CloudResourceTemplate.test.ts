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
import {
  Entity,
  isResourceEntity,
  KubernetesValidatorFunctions,
} from '@backstage/catalog-model';

import { CloudResourceTemplate } from './CloudResourceTemplate';
import templateString from './CloudResourceTemplate.example.yaml.njk';

const awsConfig = {
  accountId: '123456789012',
  region: 'us-east-1',
};

const createGroup = (
  name: string,
  namespace = 'default',
  type = 'team',
): Entity[] => {
  return [
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: { name, namespace },
      spec: { type },
    },
  ];
};

describe('CloudResourceTemplate', () => {
  beforeAll(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {}); // Suppress console.info during tests
  });

  afterAll(() => {
    (console.info as jest.Mock).mockRestore();
  });

  describe('fromConfig', () => {
    it('should create instance with minimal config', () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString:
          'kind: Resource\napiVersion: backstage.io/v1beta1\nmetadata:\n  name: test',
      });

      expect(template).toBeInstanceOf(CloudResourceTemplate);
    });

    it('should create instance with full config', () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString: 'kind: Resource',
        groups: createGroup('team-a'),
        ownerTagKey: 'team',
        labelValueMapper: (value: string) => value.toLowerCase(),
      });

      expect(template).toBeInstanceOf(CloudResourceTemplate);
    });

    it('should use defaults for optional fields', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });

      const entity = await template.render({
        data: {},
        tags: { owner: 'team-a', env: 'prod' },
      });

      expect(entity.spec?.owner).toBe('team-a');
    });
  });

  describe('child', () => {
    it('should create child instance that inherits parent config', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });

      const child = parent.child({});

      const entity = await child.render({ data: {} });

      expect(entity.metadata.annotations).toEqual({
        'aws-account-id': '123456789012',
        'aws-region': 'us-east-1',
      });
    });

    it('should override specific values in child', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });

      const child = parent.child({
        region: 'eu-west-1',
      });

      const entity = await child.render({ data: {} });

      expect(entity.metadata.annotations).toEqual({
        'aws-account-id': '123456789012',
        'aws-region': 'eu-west-1',
      });
    });

    it('should not interfere between multiple children', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        region: 'us-east-1',
      });

      const child1 = parent.child({ region: 'us-west-2' });
      const child2 = parent.child({ region: 'eu-west-1' });

      const entity1 = await child1.render({ data: {} });
      const entity2 = await child2.render({ data: {} });

      expect(entity1.metadata.annotations?.['aws-region']).toBe('us-west-2');
      expect(entity2.metadata.annotations?.['aws-region']).toBe('eu-west-1');
    });

    it('should support grandchild (child of child)', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        templateString,
        ...awsConfig,
      });

      const child = parent.child({ region: 'us-west-2' });
      const grandchild = child.child({ accountId: '999888777666' });

      const entity = await grandchild.render({ data: {} });

      expect(entity.metadata.annotations).toEqual({
        'aws-account-id': '999888777666',
        'aws-region': 'us-west-2',
      });
    });

    it('should inherit groups from parent', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        groups: createGroup('team-a'),
      });

      const child = parent.child({});

      const entity = await child.render({
        data: {},
        tags: { owner: 'team-a' },
      });

      expect(entity.spec?.owner).toBe('group:default/team-a');
    });

    it('should inherit defaultAnnotations in child', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        defaultAnnotations: { 'parent-key': 'parent-value' },
      });

      const child = parent.child({});

      const entity = await child.render({
        data: {},
        resourceAnnotations: {
          'child-key': 'child-value',
        },
      });

      expect(entity.metadata.annotations).toEqual(
        expect.objectContaining({
          'parent-key': 'parent-value',
          'child-key': 'child-value',
        }),
      );
    });

    it('should override defaultAnnotations in child', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        defaultAnnotations: {
          'parent-key': 'parent-value',
          'shared-key': 'parent-shared',
        },
      });

      const child = parent.child({
        defaultAnnotations: {
          'shared-key': 'child-override',
          'child-only': 'child-value',
        },
      });

      const entity = await child.render({ data: {} });

      expect(entity.metadata.annotations).toEqual(
        expect.objectContaining({
          'shared-key': 'child-override',
          'child-only': 'child-value',
        }),
      );
      expect(entity.metadata.annotations).not.toHaveProperty('parent-key');
    });

    it('should allow child to override parent groups', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        groups: createGroup('team-a'),
      });

      const child = parent.child({ groups: createGroup('team-b') });

      // Child should use child groups
      const childEntity = await child.render({
        data: {},
        tags: { owner: 'team-b' },
      });

      expect(childEntity.spec?.owner).toBe('group:default/team-b');

      // Parent should still use parent groups (not affected by child)
      const parentEntity = await parent.render({
        data: {},
        tags: { owner: 'team-a' },
      });

      expect(parentEntity.spec?.owner).toBe('group:default/team-a');
    });

    it('should not interfere when sibling children render concurrently with different groups', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        groups: [],
      });

      const childA = parent.child({ groups: createGroup('team-a') });
      const childB = parent.child({ groups: createGroup('team-b') });
      const childC = parent.child({ groups: createGroup('team-c') });

      // Render all children concurrently (race condition test)
      const [entityA, entityB, entityC] = await Promise.all([
        childA.render({
          data: { name: 'resource-a' },
          tags: { owner: 'team-a' },
        }),
        childB.render({
          data: { name: 'resource-b' },
          tags: { owner: 'team-b' },
        }),
        childC.render({
          data: { name: 'resource-c' },
          tags: { owner: 'team-c' },
        }),
      ]);

      // Each child should resolve its own groups correctly
      expect(entityA.spec?.owner).toBe('group:default/team-a');
      expect(entityB.spec?.owner).toBe('group:default/team-b');
      expect(entityC.spec?.owner).toBe('group:default/team-c');
    });
  });

  describe('render - basic rendering', () => {
    it('should render simple template with data interpolation', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });

      const entity = await template.render({
        data: {
          name: 'my-resource',
          title: 'My Resource',
        },
      });

      expect(entity).toEqual(
        expect.objectContaining({
          kind: 'Resource',
          apiVersion: 'backstage.io/v1beta1',
          metadata: expect.objectContaining({
            name: 'my-resource',
            title: 'My Resource',
          }),
          spec: expect.objectContaining({
            type: 'test',
          }),
        }),
      );
    });

    it('should parse YAML output correctly', async () => {
      const template = CloudResourceTemplate.fromConfig({
        templateString,
        ...awsConfig,
      });

      const entity = await template.render({ data: {} });

      expect(entity.metadata.annotations).toEqual({
        'aws-account-id': '123456789012',
        'aws-region': 'us-east-1',
      });
    });

    it('should merge resourceAnnotations into entity', async () => {
      const template = CloudResourceTemplate.fromConfig({
        templateString,
        ...awsConfig,
      });

      const entity = await template.render({
        data: {},
        resourceAnnotations: {
          'resource-key': 'resource-value',
        },
      });

      expect(entity.metadata.annotations).toEqual({
        'aws-account-id': '123456789012',
        'aws-region': 'us-east-1',
        'resource-key': 'resource-value',
      });
    });

    it('should provide accountId and region in context', async () => {
      const template = CloudResourceTemplate.fromConfig({
        templateString,
        ...awsConfig,
      });

      const entity = await template.render({ data: {} });

      expect(entity.metadata.annotations).toEqual({
        'aws-account-id': '123456789012',
        'aws-region': 'us-east-1',
      });
    });

    it('should merge defaultAnnotations with resourceAnnotations', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        defaultAnnotations: {
          'backstage.io/managed-by-location': 'aws-provider',
          'default-key': 'default-value',
        },
      });

      const entity = await template.render({
        data: {},
        resourceAnnotations: {
          'resource-key': 'resource-value',
        },
      });

      expect(entity.metadata.annotations).toEqual(
        expect.objectContaining({
          'backstage.io/managed-by-location': 'aws-provider',
          'default-key': 'default-value',
          'resource-key': 'resource-value',
        }),
      );
    });

    it('should allow resourceAnnotations to override defaultAnnotations', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        defaultAnnotations: {
          'shared-key': 'default-value',
          'default-only': 'stays',
        },
      });

      const entity = await template.render({
        data: {},
        resourceAnnotations: {
          'shared-key': 'resource-override',
          'resource-only': 'added',
        },
      });

      expect(entity.metadata.annotations).toEqual(
        expect.objectContaining({
          'shared-key': 'resource-override',
          'default-only': 'stays',
          'resource-only': 'added',
        }),
      );
    });

    it('should return valid Backstage Entity structure', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });

      const entity = await template.render({
        data: {
          name: 'test-resource',
          namespace: 'default',
        },
      });

      expect(entity).toMatchObject({
        kind: 'Resource',
        apiVersion: 'backstage.io/v1beta1',
        metadata: {
          name: 'test-resource',
          namespace: 'default',
        },
        spec: {
          type: 'test',
          owner: 'unknown',
        },
      });
      expect(isResourceEntity(entity)).toBe(true);
    });
  });

  describe('filter: arn_to_name', () => {
    it('should convert ARN to a valid `name` format', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });

      const entity = await template.render({
        data: {
          arn: 'arn:aws:rds:us-east-1:123456789012:db:mydb',
        },
      });

      expect(
        KubernetesValidatorFunctions.isValidLabelValue(entity.metadata.name),
      ).toBe(true);
    });

    it('should produce consistent output for same input', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });

      const arn = 'arn:aws:lambda:us-east-1:123456789012:function:my-function';

      const entity1 = await template.render({ data: { arn } });
      const entity2 = await template.render({ data: { arn } });

      expect(entity1.metadata.name).toBe(entity2.metadata.name);
    });

    it('should produce different names for different ARNs', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });

      const entity1 = await template.render({
        data: { arn: 'arn:aws:rds:us-east-1:123456789012:db:db1' },
      });

      const entity2 = await template.render({
        data: { arn: 'arn:aws:rds:us-east-1:123456789012:db:db2' },
      });

      expect(entity1.metadata.name).not.toBe(entity2.metadata.name);
    });

    it('should work with to_entity_name alias', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });

      const entity = await template.render({
        data: {
          arn: 'arn:aws:rds:us-east-1:123456789012:db:mydb',
        },
      });

      expect(
        KubernetesValidatorFunctions.isValidLabelValue(entity.metadata.name),
      ).toBe(true);
    });
  });

  describe('filter: labels_from_tags', () => {
    let template: CloudResourceTemplate;

    beforeAll(() => {
      template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });
    });

    it('should convert array of tags (AWS SDK format)', async () => {
      const entity = await template.render({
        data: {},
        tags: [
          { Key: 'Application', Value: 'Test Product' },
          { Key: 'Environment', Value: 'production' },
          { Key: 'Team', Value: 'platform' },
        ],
      });

      expect(entity.metadata.labels).toEqual({
        Application: 'Test-Product',
        Environment: 'production',
        Team: 'platform',
      });
    });

    it('should convert object of tags (simple key-value)', async () => {
      const entity = await template.render({
        data: {},
        tags: {
          Environment: 'production',
          Team: 'platform',
        },
      });

      expect(entity.metadata.labels).toEqual({
        Environment: 'production',
        Team: 'platform',
      });
    });

    it('should exclude relationship tags', async () => {
      const entity = await template.render({
        data: {},
        tags: {
          Environment: 'prod',
          dependsOn: 'some-service',
          dependencyOf: 'another-service',
          system: 'my-system',
          domain: 'my-domain',
        },
      });

      expect(entity.metadata.labels).toEqual({
        Environment: 'prod',
      });
    });

    it('should handle empty tags', async () => {
      const entity = await template.render({
        data: {},
        tags: {},
      });

      expect(entity.metadata.labels).toBeUndefined();
    });

    it('should sanitize keys to conform to Backstage label format', async () => {
      const entity = await template.render({
        data: {},
        tags: {
          'my/tag': 'value1',
          'another:tag': 'value2',
        },
      });

      expect(entity.metadata.labels).toEqual({
        'my-tag': 'value1',
        another_tag: 'value2',
      });
    });

    describe('with labelValueMapper', () => {
      it('should apply labelValueMapper if provided', async () => {
        const templateWithMapper = CloudResourceTemplate.fromConfig({
          ...awsConfig,
          templateString,
          labelValueMapper: (value: string) => value.toUpperCase(),
        });

        const entity = await templateWithMapper.render({
          data: {},
          tags: { env: 'production' },
        });

        expect(entity.metadata.labels).toEqual({
          env: 'PRODUCTION',
        });
      });
    });
  });

  describe('filter: owner_from_tags', () => {
    let template: CloudResourceTemplate;

    beforeAll(() => {
      template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });
    });

    it('should return owner from tags when present', async () => {
      const entity = await template.render({
        data: {},
        tags: { owner: 'team-platform' },
      });

      expect(entity.spec?.owner).toBe('team-platform');
    });

    it('should return unknown when no owner tag', async () => {
      const entity = await template.render({
        data: {},
        tags: { env: 'prod' },
      });

      expect(entity.spec?.owner).toBe('unknown');
    });

    it('should handle empty groups array', async () => {
      const entity = await template.render({
        data: {},
        tags: { owner: 'team-a' },
      });

      expect(entity.spec?.owner).toBe('team-a');
    });

    describe('with groups configured', () => {
      it('should validate owner against groups list', async () => {
        const childWithGroups = template.child({
          groups: createGroup('platform'),
        });

        const entity = await childWithGroups.render({
          data: {},
          tags: { owner: 'platform' },
        });

        expect(entity.spec?.owner).toBe('group:default/platform');
      });

      it('should return entity ref format when group match found', async () => {
        const childWithOrgGroups = template.child({
          groups: createGroup('team-a', 'org'),
        });

        const entity = await childWithOrgGroups.render({
          data: {},
          tags: { owner: 'org/team-a' },
        });

        expect(entity.spec?.owner).toBe('group:org/team-a');
      });

      it('should return string value when no group match', async () => {
        const childWithDifferentGroups = template.child({
          groups: createGroup('team-b'),
        });

        const entity = await childWithDifferentGroups.render({
          data: {},
          tags: { owner: 'team-a' },
        });

        expect(entity.spec?.owner).toBe('team-a');
      });

      it('should do case-insensitive matching', async () => {
        const childWithPlatformTeam = template.child({
          groups: createGroup('platform-team'),
        });

        const entity = await childWithPlatformTeam.render({
          data: {},
          tags: { owner: 'PLATFORM-TEAM' },
        });

        expect(entity.spec?.owner).toBe('group:default/platform-team');
      });
    });

    describe('with custom ownerTagKey', () => {
      it('should work with custom ownerTagKey', async () => {
        const templateWithCustomKey = CloudResourceTemplate.fromConfig({
          ...awsConfig,
          templateString,
          ownerTagKey: 'team',
        });

        const entity = await templateWithCustomKey.render({
          data: {},
          tags: { team: 'platform' },
        });

        expect(entity.spec?.owner).toBe('platform');
      });
    });
  });

  describe('filter: relationships_from_tags', () => {
    let template: CloudResourceTemplate;

    beforeAll(() => {
      template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });
    });

    it('should extract dependsOn relationships', async () => {
      const entity = await template.render({
        data: {},
        tags: [
          {
            Key: 'dependsOn',
            Value: 'component:default/service-a,component:default/service-b',
          },
        ],
      });

      expect(entity.spec?.dependsOn).toEqual([
        'component:default/service-a',
        'component:default/service-b',
      ]);
    });

    it('should extract dependencyOf relationships', async () => {
      const entity = await template.render({
        data: {},
        tags: [{ Key: 'dependencyOf', Value: 'component:default/api' }],
      });

      expect(entity.spec?.dependencyOf).toEqual(['component:default/api']);
    });

    it('should extract system relationship', async () => {
      const entity = await template.render({
        data: {},
        tags: [{ Key: 'system', Value: 'payment-system' }],
      });

      expect(entity.spec?.system).toEqual(['payment-system']);
    });

    it('should extract domain relationship', async () => {
      const entity = await template.render({
        data: {},
        tags: [{ Key: 'domain', Value: 'ecommerce' }],
      });

      expect(entity.spec?.domain).toEqual(['ecommerce']);
    });

    it('should handle comma-separated values in dependsOn', async () => {
      const entity = await template.render({
        data: {},
        tags: [{ Key: 'dependsOn', Value: 'service-a,service-b,service-c' }],
      });

      expect(entity.spec?.dependsOn).toEqual([
        'service-a',
        'service-b',
        'service-c',
      ]);
    });

    it('should return empty when no relationship tags', async () => {
      const entity = await template.render({
        data: {},
        tags: { env: 'prod' },
      });

      expect(entity.spec?.dependsOn).toBeUndefined();
      expect(entity.spec?.dependencyOf).toBeUndefined();
      expect(entity.spec?.system).toBeUndefined();
      expect(entity.spec?.domain).toBeUndefined();
    });
  });

  describe('integration: realistic scenarios', () => {
    it('should render with child template (different region)', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        region: 'us-east-1',
      });

      const usWest = parent.child({ region: 'us-west-2' });
      const euWest = parent.child({ region: 'eu-west-1' });

      const entity1 = await usWest.render({
        data: { name: 'resource-1' },
      });

      const entity2 = await euWest.render({
        data: { name: 'resource-2' },
      });

      expect(entity1.metadata.annotations?.['aws-region']).toBe('us-west-2');
      expect(entity2.metadata.annotations?.['aws-region']).toBe('eu-west-1');
    });

    it('should handle multiple renders with same template efficiently', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
      });

      const startTime = Date.now();

      // Render 100 entities
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(template.render({ data: { name: `resource-${i}` } }));
      }

      const entities = await Promise.all(promises);

      const duration = Date.now() - startTime;

      expect(entities).toHaveLength(100);
      expect(entities[0].metadata.name).toBe('resource-0');
      expect(entities[99].metadata.name).toBe('resource-99');

      // Should complete in reasonable time (< 1 second for 100 renders)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('getResourceAnnotations config', () => {
    it('should call getResourceAnnotations and merge annotations', async () => {
      const getResourceAnnotations = jest.fn((resource: any) => ({
        'custom-annotation': `value-${resource.id}`,
      }));

      const template = CloudResourceTemplate.fromConfig({
        templateString: `
kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.id }}
spec:
  type: test`,
        getResourceAnnotations,
        accountId: '123456789012',
        region: 'us-east-1',
      });

      const entity = await template.render({
        data: { id: 'test-resource' },
      });

      expect(getResourceAnnotations).toHaveBeenCalledWith(
        { id: 'test-resource' },
        { accountId: '123456789012', region: 'us-east-1' },
      );
      expect(entity.metadata.annotations).toEqual({
        'custom-annotation': 'value-test-resource',
      });
    });

    it('should support async getResourceAnnotations', async () => {
      const getResourceAnnotations = jest.fn(async (resource: any) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          'async-annotation': `async-${resource.name}`,
        };
      });

      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        getResourceAnnotations,
      });

      const entity = await template.render({
        data: { name: 'my-resource' },
      });

      expect(getResourceAnnotations).toHaveBeenCalledWith(
        { name: 'my-resource' },
        {
          accountId: '123456789012',
          region: 'us-east-1',
        },
      );
      expect(entity.metadata.annotations).toEqual(
        expect.objectContaining({
          'async-annotation': 'async-my-resource',
        }),
      );
    });

    it('should provide accountId and region in context', async () => {
      const getResourceAnnotations = jest.fn(() => ({}));

      const template = CloudResourceTemplate.fromConfig({
        templateString,
        accountId: '999888777666',
        region: 'eu-west-1',
        getResourceAnnotations,
      });

      await template.render({ data: {} });

      expect(getResourceAnnotations).toHaveBeenCalledWith(
        {},
        { accountId: '999888777666', region: 'eu-west-1' },
      );
    });

    it('should merge config-based and context-based annotations with config taking precedence', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        getResourceAnnotations: () => ({
          'shared-key': 'config-value',
          'config-only': 'config',
        }),
      });

      const entity = await template.render({
        data: {},
        resourceAnnotations: {
          'shared-key': 'context-value',
          'context-only': 'context',
        },
      });

      expect(entity.metadata.annotations).toEqual({
        'aws-account-id': '123456789012',
        'aws-region': 'us-east-1',
        'shared-key': 'config-value', // Config takes precedence
        'config-only': 'config',
        'context-only': 'context',
      });
    });

    it('should merge annotations', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        defaultAnnotations: {
          'default-key': 'default-value',
          shared: 'default',
        },
        getResourceAnnotations: () => ({
          'config-key': 'config-value',
          shared: 'config',
        }),
      });

      const entity = await template.render({
        data: {},
        resourceAnnotations: {
          'context-key': 'context-value',
        },
      });

      expect(entity.metadata.annotations).toEqual({
        'aws-account-id': '123456789012',
        'aws-region': 'us-east-1',
        'default-key': 'default-value',
        'context-key': 'context-value',
        'config-key': 'config-value',
        shared: 'config', // Config > context > default
      });
    });

    it('should work with child templates', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        templateString,
        accountId: '123456789012',
        region: 'us-east-1',
        getResourceAnnotations: (_resource: any, context) => ({
          'account-region': `${context.accountId}-${context.region}`,
        }),
      });

      const child = parent.child({ region: 'us-west-2' });

      const entity = await child.render({ data: {} });

      expect(entity.metadata.annotations).toEqual(
        expect.objectContaining({
          'account-region': '123456789012-us-west-2',
        }),
      );
    });

    it('should throw on getResourceAnnotations errors', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString,
        getResourceAnnotations: () => {
          throw new Error('Annotation error');
        },
      });

      await expect(template.render({ data: {} })).rejects.toThrow(
        'Failed to get resource annotations: Annotation error',
      );
    });
  });

  describe('edge cases and errors', () => {
    it('should throw on invalid YAML in template output', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString: `
kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: test
  invalid: {{ data.bad
spec:
  type: test`,
      });

      await expect(
        template.render({ data: { bad: 'value' } }),
      ).rejects.toThrow();
    });
  });

  describe('custom filters', () => {
    it('should allow adding custom filters via addCustomFilters', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString: `
kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.first | uppercase }}
  title: {{ data.second | reverse }}
spec:
  type: test`,
        addCustomFilters: env => {
          env.addFilter('uppercase', (value: string) => value.toUpperCase());
          env.addFilter('reverse', (value: string) =>
            value.split('').reverse().join(''),
          );
        },
      });

      const entity = await template.render({
        data: { first: 'hello', second: 'world' },
      });

      expect(entity.metadata.name).toBe('HELLO');
      expect(entity.metadata.title).toBe('dlrow');
    });

    it('should work with child templates', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString: `
kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: "{{ data.value | triple }}"
spec:
  type: test`,
        addCustomFilters: env => {
          env.addFilter('triple', (value: number) => value * 3);
        },
      });

      const child = parent.child({});

      const entity = await child.render({ data: { value: 4 } });

      expect(entity.metadata.name).toBe('12');
    });

    it('should not allow child to override custom filters', async () => {
      const parent = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString: `
kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: "{{ data.value | double }}"
spec:
  type: test`,
        addCustomFilters: env => {
          env.addFilter('double', (value: number) => value * 2);
        },
      });

      // Child attempts to override addCustomFilters, but parent's filters are used
      const child = parent.child({
        addCustomFilters: env => {
          env.addFilter('double', (value: number) => value * 10);
        },
      });

      const entity = await child.render({ data: { value: 5 } });

      // Should still use parent's double filter (value * 2)
      expect(entity.metadata.name).toBe('10');
    });

    it('should throw on errors in custom filters', async () => {
      const template = CloudResourceTemplate.fromConfig({
        ...awsConfig,
        templateString: `
kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.value | error_filter }}
spec:
  type: test`,
        addCustomFilters: env => {
          env.addFilter('error_filter', () => {
            throw new Error('Filter error');
          });
        },
      });

      await expect(template.render({ data: { value: 5 } })).rejects.toThrow();
    });
  });
});
