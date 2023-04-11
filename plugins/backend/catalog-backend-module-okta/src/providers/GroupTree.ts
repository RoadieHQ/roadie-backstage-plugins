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
import { GroupEntity } from '@backstage/catalog-model';

interface GroupNode {
  group: GroupEntity;
  children: GroupNode[];
}

export class GroupTree {
  private groupDict: Record<string, GroupNode> = {};
  private rootNodes: GroupNode[] = [];

  constructor(groups: GroupEntity[]) {
    for (const group of groups) {
      this.groupDict[group.metadata.name] = { group, children: [] };
    }
    for (const group of groups) {
      const parentName =
        group.spec.parent === group.metadata.name
          ? undefined
          : group.spec.parent;
      if (parentName) {
        this.groupDict[parentName].children.push(
          this.groupDict[group.metadata.name],
        );
      }
    }
    for (const group of Object.values(this.groupDict)) {
      if (!this.hasParent(group)) {
        this.rootNodes.push(group);
      }
    }
  }

  public getGroups(opts: { pruneEmptyMembers: boolean }): GroupEntity[] {
    const { pruneEmptyMembers } = opts;
    const result: GroupEntity[] = [];
    for (const group of Object.values(this.groupDict)) {
      if (pruneEmptyMembers) {
        if (this.hasMembers(group)) {
          result.push(group.group);
        }
      } else {
        result.push(group.group);
      }
    }
    return result;
  }

  private hasMembers(node: GroupNode): boolean {
    let hasMembers = node.group.spec.members?.length !== 0;
    for (const child of node.children) {
      const childHasMembers = this.hasMembers(child);
      hasMembers = hasMembers || childHasMembers;
    }
    return hasMembers;
  }

  private hasParent(node: GroupNode): boolean {
    return node.group.spec.parent === node.group.metadata.name
      ? false
      : !!node.group.spec.parent;
  }
}
