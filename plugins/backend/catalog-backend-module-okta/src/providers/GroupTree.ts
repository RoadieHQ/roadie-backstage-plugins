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
import { Logger } from 'winston';

interface GroupNode {
  group: GroupEntity;
  children: GroupNode[];
}

export class GroupTree {
  private groupDict: Record<string, GroupNode> = {};
  private groups: GroupEntity[];
  private logger: Logger;

  constructor(groups: GroupEntity[], logger: Logger) {
    this.groups = groups;
    this.logger = logger;
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
  }

  public getGroups(opts: { pruneEmptyMembers: boolean }): GroupEntity[] {
    const { pruneEmptyMembers } = opts;
    const result: GroupEntity[] = [];
    const tree = this.createTree({ pruneEmptyMembers });
    for (const node of tree) {
      this.addSubtreeNodes(node, result);
    }
    return result;
  }

  private addSubtreeNodes(node: GroupNode, result: GroupEntity[]): void {
    result.push(node.group);
    for (const child of node.children) {
      this.addSubtreeNodes(child, result);
    }
  }

  private pruneEmptyMembers(nodes: GroupNode[]): void {
    for (const node of nodes) {
      this.pruneEmptyMembers(node.children);
      this.logger.debug(
        `${node.group.metadata.name}: members=${node.group.spec.members?.length} children=${node.children.length} `,
      );
      if (node.group.spec.members?.length === 0 && node.children.length === 0) {
        this.logger.debug(`pruning ${node.group.metadata.name}`);
        const index = nodes.indexOf(node);
        nodes.splice(index, 1);
      }
    }
  }

  private hasParent(group: GroupEntity): boolean {
    return group.spec.parent === group.metadata.name
      ? false
      : !!group.spec.parent;
  }

  private createTree(opts: { pruneEmptyMembers: boolean }): GroupNode[] {
    const { pruneEmptyMembers } = opts;
    const rootNodes: GroupNode[] = [];
    for (const group of this.groups) {
      if (!this.hasParent(group)) {
        rootNodes.push(this.groupDict[group.metadata.name]);
      }
    }
    if (pruneEmptyMembers) {
      this.pruneEmptyMembers(rootNodes);
    }
    return rootNodes;
  }
}
