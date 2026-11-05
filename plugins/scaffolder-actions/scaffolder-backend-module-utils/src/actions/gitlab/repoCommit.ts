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
import {
  createTemplateAction,
  serializeDirectoryContents,
} from '@backstage/plugin-scaffolder-node';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { ScmIntegrationRegistry } from '@backstage/integration';
import path from 'node:path';
import { describeFailure, resolveGitlabApiTarget } from './common';
import { examples } from './repoCommit.examples';

type CommitActionEntry = {
  action: 'create';
  file_path: string;
  encoding: 'base64';
  content: string;
  execute_filemode?: boolean;
};

type GitlabCommit = {
  id: string;
  web_url?: string;
};

const isGitlabCommit = (value: unknown): value is GitlabCommit =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof Reflect.get(value, 'id') === 'string';

export const createGitlabRepoCommitAction = (options: {
  integrations: ScmIntegrationRegistry;
}) => {
  const { integrations } = options;

  return createTemplateAction({
    id: 'gitlab:repo:commit',
    description:
      'Creates a commit through the GitLab Commits API so GitLab records the token owner as author and committer. Works against an empty repository.',
    examples,
    schema: {
      input: {
        repoUrl: z =>
          z.string({
            description: `Accepts the format 'gitlab.com?repo=project_name&owner=group_name'`,
          }),
        branch: z =>
          z.string({
            description: 'The branch to commit to. Created if it is missing.',
          }),
        commitMessage: z =>
          z.string({
            description: 'The commit message',
          }),
        startBranch: z =>
          z
            .string({
              description:
                'Existing branch to create `branch` from. Only needed when the repository already has commits and `branch` does not exist yet.',
            })
            .optional(),
        sourcePath: z =>
          z
            .string({
              description:
                'Subdirectory of the workspace to take the files from. Defaults to the whole workspace.',
            })
            .optional(),
        targetPath: z =>
          z
            .string({
              description:
                'Subdirectory of the repository to write the files into. Defaults to the repository root.',
            })
            .optional(),
        token: z =>
          z
            .string({
              description:
                'The token to authorize with. When set it is treated as a user OAuth token, which is what makes GitLab attribute the commit to that user.',
            })
            .optional(),
        tokenType: z =>
          z
            .enum(['oauth', 'private'], {
              description:
                'How to send the token. Defaults to `oauth` when `token` is supplied and `private` when falling back to the integration token.',
            })
            .optional(),
        setDefaultBranch: z =>
          z
            .boolean({
              description:
                "Point the project's default branch at `branch` after committing. Useful when bootstrapping an empty repository whose default branch name differs from `branch`.",
            })
            .optional(),
      },
      output: {
        commitHash: z => z.string({ description: 'The created commit hash' }),
        commitUrl: z =>
          z.string({ description: 'A URL to the created commit' }).optional(),
        projectId: z =>
          z.string({ description: 'The GitLab project path or id used' }),
        branch: z => z.string({ description: 'The branch committed to' }),
      },
    },
    async handler(ctx) {
      const {
        repoUrl,
        branch,
        commitMessage,
        startBranch,
        sourcePath,
        targetPath,
        setDefaultBranch = false,
      } = ctx.input;

      const { projectId, apiBase, headers } = resolveGitlabApiTarget({
        repoUrl,
        integrations,
        token: ctx.input.token,
        tokenType: ctx.input.tokenType,
      });

      const fileRoot = sourcePath
        ? resolveSafeChildPath(ctx.workspacePath, sourcePath)
        : ctx.workspacePath;

      const files = await serializeDirectoryContents(fileRoot, {
        gitignore: true,
      });

      const actions: CommitActionEntry[] = files
        .filter(file => !file.symlink)
        .map(file => ({
          action: 'create',
          file_path: targetPath
            ? path.posix.join(targetPath, file.path)
            : file.path,
          encoding: 'base64',
          content: file.content.toString('base64'),
          ...(file.executable ? { execute_filemode: true } : {}),
        }));

      if (actions.length === 0) {
        throw new InputError(
          `No files found under ${sourcePath ?? 'the workspace'} to commit`,
        );
      }

      ctx.logger.info(
        `Creating a commit on ${projectId} (${branch}) with ${actions.length} file(s) via the GitLab Commits API`,
      );

      const commit = await ctx.checkpoint({
        key: `gitlab.commit.create.${projectId}.${branch}`,
        fn: async () => {
          const response = await fetch(`${apiBase}/repository/commits`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              branch,
              commit_message: commitMessage,
              actions,
              ...(startBranch ? { start_branch: startBranch } : {}),
            }),
          });

          if (!response.ok) {
            throw new InputError(
              `Failed to create a commit on ${projectId} (${branch}). ${await describeFailure(
                response,
              )}`,
            );
          }

          const body: unknown = await response.json();
          if (!isGitlabCommit(body)) {
            throw new InputError(
              `GitLab returned an unexpected commit payload for ${projectId} (${branch})`,
            );
          }

          return { id: body.id, webUrl: body.web_url ?? null };
        },
      });

      if (setDefaultBranch) {
        await ctx.checkpoint({
          key: `gitlab.default_branch.${projectId}.${branch}`,
          fn: async () => {
            const response = await fetch(apiBase, {
              method: 'PUT',
              headers,
              body: JSON.stringify({ default_branch: branch }),
            });

            if (!response.ok) {
              throw new InputError(
                `Committed to ${branch} but failed to set it as the default branch of ${projectId}. ${await describeFailure(
                  response,
                )}`,
              );
            }

            return true;
          },
        });
      }

      ctx.output('commitHash', commit.id);
      if (commit.webUrl) {
        ctx.output('commitUrl', commit.webUrl);
      }
      ctx.output('projectId', projectId);
      ctx.output('branch', branch);
    },
  });
};
