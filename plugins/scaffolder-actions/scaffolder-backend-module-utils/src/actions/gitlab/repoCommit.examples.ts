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
      'Commits the whole workspace to a branch. The branch is created if it does not exist yet.',
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
          },
        },
      ],
    }),
  },
  {
    description:
      'Bootstraps an empty repository created by `publish:gitlab` and points the default branch at the committed branch.',
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
          },
        },
      ],
    }),
  },
  {
    description:
      'Attributes the commit to the user running the template by passing their GitLab OAuth token.',
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
            token: '${{ secrets.USER_OAUTH_TOKEN }}',
          },
        },
      ],
    }),
  },
  {
    description:
      'Authorizes with a personal or group access token instead of an OAuth token.',
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
            token: '${{ secrets.GITLAB_PAT }}',
            tokenType: 'private',
          },
        },
      ],
    }),
  },
  {
    description:
      'Commits a subdirectory of the workspace into a subdirectory of the repository.',
    example: yaml.stringify({
      steps: [
        {
          id: 'commit',
          action: 'gitlab:repo:commit',
          name: 'Commit to GitLab',
          input: {
            repoUrl: 'gitlab.com?repo=project_name&owner=group_name',
            branch: 'main',
            commitMessage: 'Add generated manifests',
            sourcePath: 'generated/manifests',
            targetPath: 'deploy/manifests',
          },
        },
      ],
    }),
  },
  {
    description:
      'Creates a feature branch from an existing branch and commits to it, ready for a merge request.',
    example: yaml.stringify({
      steps: [
        {
          id: 'commit',
          action: 'gitlab:repo:commit',
          name: 'Commit to GitLab',
          input: {
            repoUrl: 'gitlab.com?repo=project_name&owner=group_name',
            branch: 'add-catalog-info',
            startBranch: 'main',
            commitMessage: 'Add catalog-info.yaml',
          },
        },
      ],
    }),
  },
];
