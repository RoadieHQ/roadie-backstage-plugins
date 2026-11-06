/*
 * Copyright 2026 Larder Software Limited
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
import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
  {
    description:
      'Protects a branch with the GitLab defaults, where maintainers can push and merge.',
    example: yaml.stringify({
      steps: [
        {
          id: 'protect',
          action: 'gitlab:repo:protect',
          name: 'Protect the default branch',
          input: {
            repoUrl: 'gitlab.com?repo=project_name&owner=group_name',
            branch: 'main',
          },
        },
      ],
    }),
  },
  {
    description:
      'Blocks direct pushes so changes only reach the branch through a merge request.',
    example: yaml.stringify({
      steps: [
        {
          id: 'protect',
          action: 'gitlab:repo:protect',
          name: 'Protect the default branch',
          input: {
            repoUrl: 'gitlab.com?repo=project_name&owner=group_name',
            branch: 'main',
            allowedToPush: 'no one',
            allowedToMerge: 'developer',
          },
        },
      ],
    }),
  },
  {
    description:
      'Protects every release branch with a wildcard and stops developers from unprotecting it.',
    example: yaml.stringify({
      steps: [
        {
          id: 'protect',
          action: 'gitlab:repo:protect',
          name: 'Protect release branches',
          input: {
            repoUrl: 'gitlab.com?repo=project_name&owner=group_name',
            branch: 'release/*',
            allowedToPush: 'maintainer',
            allowedToMerge: 'maintainer',
            allowedToUnprotect: 'admin',
          },
        },
      ],
    }),
  },
  {
    description:
      'Fails the step instead of replacing a rule that already protects the branch. By default the existing rule is replaced, because GitLab protects the default branch of a new project on its own.',
    example: yaml.stringify({
      steps: [
        {
          id: 'protect',
          action: 'gitlab:repo:protect',
          name: 'Protect the default branch',
          input: {
            repoUrl: 'gitlab.com?repo=project_name&owner=group_name',
            branch: 'main',
            allowedToPush: 'no one',
            replaceExisting: false,
          },
        },
      ],
    }),
  },
  {
    description:
      'Requires code owner approval on merge requests touching CODEOWNERS paths. Needs GitLab Premium or above.',
    example: yaml.stringify({
      steps: [
        {
          id: 'protect',
          action: 'gitlab:repo:protect',
          name: 'Protect the default branch',
          input: {
            repoUrl: 'gitlab.com?repo=project_name&owner=group_name',
            branch: 'main',
            allowedToMerge: 'developer',
            codeOwnerApprovalRequired: true,
          },
        },
      ],
    }),
  },
  {
    description:
      'Commits to a new repository and protects the branch afterwards, authorizing both steps with the user OAuth token.',
    example: yaml.stringify({
      steps: [
        {
          id: 'commit',
          action: 'gitlab:repo:commit',
          name: 'Commit to GitLab',
          input: {
            repoUrl: 'gitlab.com?repo=project_name&owner=group_name',
            branch: 'main',
            commitMessage: 'Initial commit',
            setDefaultBranch: true,
            token: '${{ secrets.USER_OAUTH_TOKEN }}',
          },
        },
        {
          id: 'protect',
          action: 'gitlab:repo:protect',
          name: 'Protect the default branch',
          input: {
            repoUrl: 'gitlab.com?repo=project_name&owner=group_name',
            branch: '${{ steps.commit.output.branch }}',
            allowedToPush: 'no one',
            allowedToMerge: 'developer',
            token: '${{ secrets.USER_OAUTH_TOKEN }}',
          },
        },
      ],
    }),
  },
];
