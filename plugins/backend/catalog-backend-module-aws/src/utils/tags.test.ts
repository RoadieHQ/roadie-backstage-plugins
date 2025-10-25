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

import { ownerFromTags, labelsFromTags, relationshipsFromTags } from './tags';
import { Entity, KubernetesValidatorFunctions } from '@backstage/catalog-model';

describe('labelsFromTags and ownerFromTags', () => {
  describe('labelsFromTags', () => {
    it('should return an empty object if no tags are provided', () => {
      const result = labelsFromTags();
      expect(result).toEqual({});
    });

    it('should correctly process array of tags', () => {
      const tags = [
        { Key: 'tag:one', Value: 'value1' },
        { Key: 'tag:two', Value: 'value2' },
      ];
      const result = labelsFromTags(tags);
      expect(result).toEqual({ tag_one: 'value1', tag_two: 'value2' });
    });

    it('should correctly process an object of tags', () => {
      const tags = { 'tag:one': 'value1', 'tag:two': 'value2' };
      const result = labelsFromTags(tags);
      expect(result).toEqual({ tag_one: 'value1', tag_two: 'value2' });
    });

    it('should ignore entries without keys or values in an array of tags', () => {
      const tags = [{ Key: 'tag:one' }, { Value: 'value2' }, {}];
      const result = labelsFromTags(tags);
      expect(result).toEqual({});
    });

    it('should handle complex keys and values in an array of tags', () => {
      const tags = [{ Key: 'tag:one:two', Value: 'value1:value2' }];
      const result = labelsFromTags(tags);
      expect(result).toEqual({ tag_one_two: 'value1-value2' });
      expect(
        KubernetesValidatorFunctions.isValidLabelValue(result.tag_one_two),
      ).toBe(true);
    });

    it('should handle a url as a value', () => {
      const tags = [{ Key: 'tag:one:two', Value: 'https://blha.com/blahblah' }];
      const result = labelsFromTags(tags);
      expect(result).toEqual({ tag_one_two: 'https---blha.com-blahblah' });
      expect(
        KubernetesValidatorFunctions.isValidLabelValue(result.tag_one_two),
      ).toBe(true);
    });

    it('I can provide my own value mapper', () => {
      const tags = [{ Key: 'tag:one:two', Value: 'https://blha.com/blahblah' }];
      const result = labelsFromTags(tags, value => value);
      expect(result).toEqual({ tag_one_two: 'https://blha.com/blahblah' });
    });

    it('should handle a url with a succeeding slash as a value', () => {
      const tags = [
        { Key: 'tag:one:two', Value: 'https://blha.com/blahblah/' },
      ];
      const result = labelsFromTags(tags);
      expect(result).toEqual({ tag_one_two: 'https---blha.com-blahblah' });
      expect(
        KubernetesValidatorFunctions.isValidLabelValue(result.tag_one_two),
      ).toBe(true);
    });

    it('should convert tags with characters not compatible with `name` into valid labels', () => {
      const tags = [
        { Key: 'Tb<Pt t,4%I', Value: '#K]:_W#T9G' },
        { Key: ';aI/Si=5Ex', Value: '{_toD) ]TB5' },
        { Key: 'FL:<KqW;:K', Value: '43P)MBbfaa' }
      ];
      const result = labelsFromTags(tags);
      expect(result).toEqual({
        Tb_Pt_t_4_I: 'K--_W-T9G',
        'aI-Si_5Ex': 'toD---TB5',
        FL__KqW__K: '43P-MBbfaa'
      });
      Object.values(result).forEach(value => {
        expect(
          KubernetesValidatorFunctions.isValidLabelValue(value),
        ).toBe(true);
      });
    });

    it('should convert tags with spaces into valid labels', () => {
      const tags = [{ Key: 'tag one two', Value: 'value one two' }];
      const result = labelsFromTags(tags);
      expect(result).toEqual({ tag_one_two: 'value-one-two' });
      expect(
        KubernetesValidatorFunctions.isValidLabelValue(result.tag_one_two),
      ).toBe(true);
    });

    it('should ignore keys without values in an object of tags', () => {
      const tags = { 'tag:one': 'value1', 'tag:two': undefined };
      // @ts-ignore
      const result = labelsFromTags(tags);
      expect(result).toEqual({ tag_one: 'value1' });
    });

    it('should ignore keys without values in an object of tags if I provide my own mapper', () => {
      const tags = { 'tag:one': 'value1', 'tag:two': undefined };
      // @ts-ignore
      const result = labelsFromTags(tags, value => value);
      expect(result).toEqual({ tag_one: 'value1' });
    });
  });

  describe('ownerFromTags', () => {
    const groups = [
      { kind: 'Group', metadata: { name: 'owner1', namespace: 'test' } },
      { kind: 'Group', metadata: { name: 'owner2', namespace: 'default' } },
    ] as Entity[];

    it('should return "unknown" if no tags are provided', () => {
      const result = ownerFromTags();
      expect(result).toBe('unknown');
    });

    it('should return owner as entity ref from array of tags if the owner is found in existing groups', () => {
      const tags = [
        { Key: 'owner', Value: 'owner1' },
        { Key: 'tag:two', Value: 'value2' },
      ];
      const result = ownerFromTags(tags, undefined, groups);
      expect(result).toBe('group:test/owner1');
    });

    it('should return owner as value string from array of tags if the owner is not found in existing groups', () => {
      const tags = [
        { Key: 'owner', Value: 'owner3' },
        { Key: 'tag:two', Value: 'value2' },
      ];
      const result = ownerFromTags(tags, undefined, groups);
      expect(result).toBe('owner3');
    });

    it('should return owner from array of tags if groups is not defined', () => {
      const tags = [
        { Key: 'owner', Value: 'owner3' },
        { Key: 'tag:two', Value: 'value2' },
      ];
      const result = ownerFromTags(tags);
      expect(result).toBe('owner3');
    });

    it('should return owner from array of tags with capitalisation', () => {
      const tags = [
        { Key: 'Owner', Value: 'owner1' },
        { Key: 'Another', Value: 'value2' },
      ];
      const result = ownerFromTags(tags);
      expect(result).toBe('owner1');
    });

    it('should return "unknown" when no owner tag in array', () => {
      const tags = [
        { Key: 'tag:one', Value: 'value1' },
        { Key: 'tag:two', Value: 'value2' },
      ];
      const result = ownerFromTags(tags, undefined, groups);
      expect(result).toBe('unknown');
    });

    it('should return "unknown" when owner tag has no value in array', () => {
      const tags = [{ Key: 'owner' }, { Key: 'tag:two', Value: 'value2' }];
      const result = ownerFromTags(tags, undefined, groups);
      expect(result).toBe('unknown');
    });

    it('should return owner from an object of tags when it matches existing group', () => {
      const tags = { owner: 'owner1', 'tag:two': 'value2' };
      const result = ownerFromTags(tags, undefined, groups);
      expect(result).toBe('group:test/owner1');
    });

    it('should return "unknown" when no owner tag in an object of tags', () => {
      const tags = { 'tag:one': 'value1', 'tag:two': 'value2' };
      const result = ownerFromTags(tags, undefined, groups);
      expect(result).toBe('unknown');
    });

    it('should return owner from an object of tags with different ownerTagKey', () => {
      const tags = { tagOwner: 'owner1', 'tag:two': 'value2' };
      const result = ownerFromTags(tags, 'tagOwner', groups);
      expect(result).toBe('group:test/owner1');
    });

    it('should return owner from an object of tags with different ownerTagKey when tag contains namespace', () => {
      const tags = { tagOwner: 'test/owner1', 'tag:two': 'value2' };
      const groupsWithMultipleNamespaces = [
        ...groups,
        {
          kind: 'Group',
          metadata: { name: 'owner1', namespace: 'default' },
        } as Entity,
      ];
      const result = ownerFromTags(
        tags,
        'tagOwner',
        groupsWithMultipleNamespaces,
      );
      expect(result).toBe('group:test/owner1');
    });

    it('should handle complex owner keys and values in an array of tags', () => {
      const tags = [{ Key: 'owner:one', Value: 'owner1' }];
      const result = ownerFromTags(tags, 'owner:one', groups);
      expect(result).toBe('group:test/owner1');
    });

    it('should handle complex owner keys and values in an object of tags', () => {
      const tags = { 'owner:one': 'owner1' };
      const result = ownerFromTags(tags, 'owner:one', groups);
      expect(result).toBe('group:test/owner1');
    });
  });
});

describe('relationshipsFromTags', () => {
  it('should return an empty object if tags is undefined', () => {
    const output = relationshipsFromTags();
    expect(output).toEqual({});
  });

  it('should return an empty object if tags is an empty array', () => {
    const output = relationshipsFromTags([]);
    expect(output).toEqual({});
  });

  it('should return relationships from an array of tags', () => {
    const tags = [{ Key: 'dependsOn', Value: 'Value1' }];
    const output = relationshipsFromTags(tags);
    expect(output).toEqual({ dependsOn: ['Value1'] });
  });

  it('should be case-insensitive when matching tag keys', () => {
    const tags = [{ Key: 'dePeNdsOn', Value: 'Value1' }];
    const output = relationshipsFromTags(tags);
    expect(output).toEqual({ dependsOn: ['Value1'] });
  });
  it('should work with dependency of tag', () => {
    const tags = [{ Key: 'dependencyOf', Value: 'Value1' }];
    const output = relationshipsFromTags(tags);
    expect(output).toEqual({ dependencyOf: ['Value1'] });
  });
});
