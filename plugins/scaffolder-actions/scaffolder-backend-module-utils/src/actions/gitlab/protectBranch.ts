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
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { InputError } from '@backstage/errors';
import { ScmIntegrationRegistry } from '@backstage/integration';
import { describeFailure, resolveGitlabApiTarget } from './common';
import { examples } from './protectBranch.examples';

const ACCESS_LEVELS = {
  'no one': 0,
  developer: 30,
  maintainer: 40,
  admin: 60,
} as const;

type ProtectedBranch = {
  id: number;
  name: string;
};

const isProtectedBranch = (value: unknown): value is ProtectedBranch =>
  typeof value === 'object' &&
  value !== null &&
  typeof Reflect.get(value, 'id') === 'number' &&
  typeof Reflect.get(value, 'name') === 'string';

export const createGitlabRepoProtectAction = (options: {
  integrations: ScmIntegrationRegistry;
}) => {
  const { integrations } = options;

  return createTemplateAction({
    id: 'gitlab:repo:protect',
    description:
      'Protects a branch through the GitLab Protected Branches API. Use it after the branch exists, for example after a gitlab:repo:commit step.',
    examples,
    schema: {
      input: {
        repoUrl: z =>
          z.string({
            description: `Accepts the format 'gitlab.com?repo=project_name&owner=group_name'`,
          }),
        branch: z =>
          z.string({
            description:
              'The branch to protect. Accepts a wildcard such as `release/*`.',
          }),
        allowedToPush: z =>
          z
            .enum(['no one', 'developer', 'maintainer', 'admin'], {
              description:
                'The lowest role allowed to push to the branch. Defaults to `maintainer`, which is what GitLab itself defaults to.',
            })
            .optional(),
        allowedToMerge: z =>
          z
            .enum(['no one', 'developer', 'maintainer', 'admin'], {
              description:
                'The lowest role allowed to merge into the branch. Defaults to `maintainer`.',
            })
            .optional(),
        allowedToUnprotect: z =>
          z
            .enum(['no one', 'developer', 'maintainer', 'admin'], {
              description:
                'The lowest role allowed to unprotect the branch. Left to the GitLab default when omitted.',
            })
            .optional(),
        allowForcePush: z =>
          z
            .boolean({
              description:
                'Allow users who can push to also force push. Defaults to the GitLab default of false.',
            })
            .optional(),
        codeOwnerApprovalRequired: z =>
          z
            .boolean({
              description:
                'Require an approval from a code owner when a merge request changes files matching CODEOWNERS. Premium and above only.',
            })
            .optional(),
        replaceExisting: z =>
          z
            .boolean({
              description:
                'Replace an existing protection rule for the branch. Defaults to true, because GitLab protects the default branch of a new project on its own. Set it to false to fail the step instead.',
            })
            .optional(),
        token: z =>
          z
            .string({
              description:
                'The token to authorize with. When set it is treated as a user OAuth token.',
            })
            .optional(),
        tokenType: z =>
          z
            .enum(['oauth', 'private'], {
              description:
                'How to send the token. Defaults to `oauth` when `token` is supplied and `private` when falling back to the integration token.',
            })
            .optional(),
      },
      output: {
        projectId: z =>
          z.string({ description: 'The GitLab project path or id used' }),
        branch: z => z.string({ description: 'The branch that was protected' }),
        protectedBranchId: z =>
          z.number({ description: 'The id of the created protection rule' }),
      },
    },
    async handler(ctx) {
      const {
        repoUrl,
        branch,
        allowedToPush = 'maintainer',
        allowedToMerge = 'maintainer',
        allowedToUnprotect,
        allowForcePush,
        codeOwnerApprovalRequired,
        replaceExisting = true,
        token,
        tokenType,
      } = ctx.input;

      const { projectId, apiBase, headers } = resolveGitlabApiTarget({
        repoUrl,
        integrations,
        token,
        tokenType,
      });

      const protectedBranchesUrl = `${apiBase}/protected_branches`;

      ctx.logger.info(
        `Protecting ${branch} on ${projectId} with push access for ${allowedToPush} and merge access for ${allowedToMerge}`,
      );

      const protection = await ctx.checkpoint({
        key: `gitlab.protect.create.${projectId}.${branch}`,
        fn: async () => {
          const createProtection = () =>
            fetch(protectedBranchesUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                name: branch,
                push_access_level: ACCESS_LEVELS[allowedToPush],
                merge_access_level: ACCESS_LEVELS[allowedToMerge],
                ...(allowedToUnprotect
                  ? {
                      unprotect_access_level: ACCESS_LEVELS[allowedToUnprotect],
                    }
                  : {}),
                ...(allowForcePush === undefined
                  ? {}
                  : { allow_force_push: allowForcePush }),
                ...(codeOwnerApprovalRequired === undefined
                  ? {}
                  : {
                      code_owner_approval_required: codeOwnerApprovalRequired,
                    }),
              }),
            });

          let response = await createProtection();

          if (response.status === 409) {
            if (!replaceExisting) {
              throw new InputError(
                `Branch ${branch} on ${projectId} is already protected. Set replaceExisting to true to replace the existing rule.`,
              );
            }

            ctx.logger.info(
              `${branch} on ${projectId} is already protected, replacing the existing rule`,
            );

            const deletion = await fetch(
              `${protectedBranchesUrl}/${encodeURIComponent(branch)}`,
              { method: 'DELETE', headers },
            );

            if (!deletion.ok && deletion.status !== 404) {
              throw new InputError(
                `Failed to remove the existing protection of ${branch} on ${projectId}. ${await describeFailure(
                  deletion,
                )}`,
              );
            }

            response = await createProtection();
          }

          if (!response.ok) {
            throw new InputError(
              `Failed to protect ${branch} on ${projectId}. ${await describeFailure(
                response,
              )}`,
            );
          }

          const body: unknown = await response.json();
          if (!isProtectedBranch(body)) {
            throw new InputError(
              `GitLab returned an unexpected protected branch payload for ${projectId} (${branch})`,
            );
          }

          return { id: body.id };
        },
      });

      ctx.output('projectId', projectId);
      ctx.output('branch', branch);
      ctx.output('protectedBranchId', protection.id);
    },
  });
};
