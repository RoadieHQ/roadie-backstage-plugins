/*
 * Copyright 2023 Larder Software Limited
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
import { GroupTree } from './GroupTree';
import { GroupEntity } from '@backstage/catalog-model';

const noMembers: Partial<GroupEntity>[] = [
  {
    metadata: {
      name: 'group-1',
    },
    spec: {
      type: 'group',
      members: [],
      children: [],
    },
  },
];

const withMembersTree: Partial<GroupEntity>[] = [
  {
    metadata: {
      name: 'group-1',
    },
    spec: {
      type: 'group',
      members: [],
      children: ['group-2', 'group-3'],
    },
  },
  {
    metadata: {
      name: 'group-2',
    },
    spec: {
      type: 'group',
      parent: 'group-1',
      members: [],
      children: [],
    },
  },
  {
    metadata: {
      name: 'group-4',
    },
    spec: {
      type: 'group',
      parent: 'group-2',
      members: ['member-1'],
      children: [],
    },
  },
  {
    metadata: {
      name: 'group-3',
    },
    spec: {
      type: 'group',
      parent: 'group-1',
      members: [],
      children: [],
    },
  },
];

describe('group tree', () => {
  it('returns an empty list of groups the groups', () => {
    const groups = new GroupTree([]).getGroups({ pruneEmptyMembers: false });
    expect(groups.length).toEqual(0);
  });

  it('returns items with no members', () => {
    const filteredGroups = new GroupTree(noMembers as GroupEntity[]).getGroups({
      pruneEmptyMembers: false,
    });
    expect(filteredGroups.length).toEqual(1);
  });

  it('removes items with no members', () => {
    const filteredGroups = new GroupTree(noMembers as GroupEntity[]).getGroups({
      pruneEmptyMembers: true,
    });
    expect(filteredGroups.length).toEqual(0);
  });

  it('removes empty members from a tree', () => {
    const filteredGroups = new GroupTree(
      withMembersTree as GroupEntity[],
    ).getGroups({ pruneEmptyMembers: true });
    expect(filteredGroups.length).toEqual(3);
  });
});
