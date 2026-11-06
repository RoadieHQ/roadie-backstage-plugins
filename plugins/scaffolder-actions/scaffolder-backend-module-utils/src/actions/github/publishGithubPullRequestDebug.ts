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
import path from 'path';
import {
  DefaultGithubCredentialsProvider,
  GithubCredentialsProvider,
  ScmIntegrationRegistry,
} from '@backstage/integration';
import {
  createTemplateAction,
  parseRepoUrl,
  serializeDirectoryContents,
} from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { CustomErrorBase, InputError } from '@backstage/errors';
import { Octokit } from 'octokit';
import {
  createPullRequest,
  DELETE_FILE,
} from 'octokit-plugin-create-pull-request';
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// Files sent as utf-8 are inlined into the single POST /git/trees call;
// base64 files each require a separate POST /git/blobs round-trip. Over
// high-latency GHES links this can turn a 2-second PR into a 10-minute
// one when large templates are rendered. Detect binary by scanning for a
// NUL byte in the first 8 KiB (same heuristic git uses) and only fall
// back to base64 when we must.
//
// The tree API also caps total request size (~6 MiB), so any individual
// file larger than this threshold is routed through the blob path to keep
// the tree payload lean.
export const UTF8_MAX_INLINE_BYTES = 1 * 1024 * 1024;

export const isBinaryBuffer = (buf: Buffer): boolean => {
  const n = Math.min(buf.length, 8000);
  for (let i = 0; i < n; i++) {
    if (buf[i] === 0) {
      return true;
    }
  }
  return false;
};

export const determineFileEncoding = (file: {
  content: Buffer;
  symlink?: boolean;
}): 'utf-8' | 'base64' => {
  if (file.symlink) {
    return 'utf-8';
  }
  if (file.content.length > UTF8_MAX_INLINE_BYTES) {
    return 'base64';
  }
  return isBinaryBuffer(file.content) ? 'base64' : 'utf-8';
};

interface PullRequestFile {
  content: string;
  encoding: 'utf-8' | 'base64';
  mode?: string;
}

type FileContent = string | PullRequestFile | typeof DELETE_FILE | null;

interface PullRequestChange {
  files: Record<string, FileContent>;
  commit: string;
  author?: {
    name: string;
    email: string;
  };
}

interface CreatePullRequestOptions {
  owner: string;
  repo: string;
  title: string;
  body: string;
  head: string;
  base?: string;
  changes: PullRequestChange[];
  draft?: boolean;
  update?: boolean;
  forceFork?: boolean;
  createWhenEmpty?: boolean;
}

interface FileInfo {
  path: string;
  size: number;
}

function getFilesRecursively(dir: string, basePath: string = dir): FileInfo[] {
  const files: FileInfo[] = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getFilesRecursively(fullPath, basePath));
    } else {
      files.push({ path: relative(basePath, fullPath), size: stat.size });
    }
  }
  return files;
}

class GithubResponseError extends CustomErrorBase {}

const DEFAULT_TIMEOUT_MS = 60000;

interface GetOctokitOptionsParams {
  integrations: ScmIntegrationRegistry;
  credentialsProvider?: GithubCredentialsProvider;
  token?: string;
  repoUrl?: string;
  host?: string;
  owner?: string;
  repo?: string;
}

async function getOctokitOptions(options: GetOctokitOptionsParams) {
  const { integrations, credentialsProvider, token, repoUrl } = options;
  const { host, owner, repo } = repoUrl
    ? parseRepoUrl(repoUrl, integrations)
    : (options as { host: string; owner: string; repo: string });

  const requestOptions = {
    timeout: DEFAULT_TIMEOUT_MS,
  };

  const integrationConfig = integrations.github.byHost(host)?.config;
  if (!integrationConfig) {
    throw new InputError(`No integration for host ${host}`);
  }

  if (token) {
    return {
      auth: token,
      baseUrl: integrationConfig.apiBaseUrl,
      previews: ['nebula-preview'],
      request: requestOptions,
    };
  }

  if (!owner || !repo) {
    throw new InputError(
      `No owner and/or repo provided, which is required if a token is not provided`,
    );
  }

  const githubCredentialsProvider =
    credentialsProvider ??
    DefaultGithubCredentialsProvider.fromIntegrations(integrations);
  const { token: credentialProviderToken } =
    await githubCredentialsProvider.getCredentials({
      url: `https://${host}/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo,
      )}`,
    });

  if (!credentialProviderToken) {
    throw new InputError(
      `No token available for host: ${host}, with owner ${owner}, and repo ${repo}. Make sure GitHub auth is configured correctly. See https://backstage.io/docs/auth/github/provider for more details.`,
    );
  }

  return {
    auth: credentialProviderToken,
    baseUrl: integrationConfig.apiBaseUrl,
    previews: ['nebula-preview'],
  };
}

interface ClientFactoryParams {
  integrations: ScmIntegrationRegistry;
  githubCredentialsProvider?: GithubCredentialsProvider;
  owner: string;
  repo: string;
  host?: string;
  token?: string;
}

interface OctokitPRClient extends Octokit {
  createPullRequest: (options: CreatePullRequestOptions) => Promise<{
    data: {
      base: { ref: string };
      html_url: string;
      number: number;
    };
  } | null>;
}

function createOctokitPRClient(
  options: ConstructorParameters<typeof Octokit>[0],
): OctokitPRClient {
  const OctokitWithPlugin = Octokit.plugin(createPullRequest);
  return new OctokitWithPlugin(options) as OctokitPRClient;
}

const defaultClientFactory = async ({
  integrations,
  githubCredentialsProvider,
  owner,
  repo,
  host = 'github.com',
  token: providedToken,
}: ClientFactoryParams): Promise<OctokitPRClient> => {
  const octokitOptions = await getOctokitOptions({
    integrations,
    credentialsProvider: githubCredentialsProvider,
    host,
    owner,
    repo,
    token: providedToken,
  });

  return createOctokitPRClient({
    ...octokitOptions,
    throttle: { enabled: false },
  });
};

export interface CreatePublishGithubPullRequestDebugActionOptions {
  integrations: ScmIntegrationRegistry;
  githubCredentialsProvider?: GithubCredentialsProvider;
  clientFactory?: typeof defaultClientFactory;
  config?: Config;
  logger: LoggerService;
}

export function createPublishGithubPullRequestDebugAction(
  options: CreatePublishGithubPullRequestDebugActionOptions,
) {
  const {
    integrations,
    githubCredentialsProvider,
    clientFactory = defaultClientFactory,
    config,
    logger,
  } = options;

  return createTemplateAction({
    id: 'publish:github:pull-request:debug',
    description:
      'Debug version of publish:github:pull-request - forked from Backstage with additional logging',
    supportsDryRun: true,
    schema: {
      input: {
        repoUrl: z =>
          z.string({
            description:
              'Repo URL in the format: github.com?repo=name&owner=owner',
          }),
        branchName: z =>
          z.string({ description: 'The name for the branch to create' }),
        title: z => z.string({ description: 'The title of the pull request' }),
        description: z =>
          z.string({ description: 'The description of the pull request' }),
        filesToDelete: z =>
          z
            .array(z.string(), {
              description: 'Files to delete from the target branch',
            })
            .optional(),
        targetBranchName: z =>
          z
            .string({ description: 'The target branch for the pull request' })
            .optional(),
        draft: z =>
          z
            .boolean({
              description: 'Whether to create a draft pull request',
            })
            .optional(),
        sourcePath: z =>
          z
            .string({
              description: 'Subdirectory of the workspace to use as the source',
            })
            .optional(),
        targetPath: z =>
          z
            .string({
              description: 'Subdirectory of the repository to target',
            })
            .optional(),
        token: z =>
          z
            .string({ description: 'GitHub access token to use for auth' })
            .optional(),
        reviewers: z =>
          z
            .array(z.string(), {
              description: 'Reviewers for the pull request',
            })
            .optional(),
        assignees: z =>
          z
            .array(z.string(), {
              description: 'Assignees for the pull request',
            })
            .optional(),
        teamReviewers: z =>
          z
            .array(z.string(), {
              description: 'Team reviewers for the pull request',
            })
            .optional(),
        commitMessage: z =>
          z
            .string({ description: 'Custom commit message for the changes' })
            .optional(),
        update: z =>
          z
            .boolean({
              description: 'Update an existing pull request if it exists',
            })
            .optional(),
        forceFork: z =>
          z
            .boolean({
              description: 'Force creating a fork for the pull request',
            })
            .optional(),
        gitAuthorName: z =>
          z.string({ description: 'Git author name' }).optional(),
        gitAuthorEmail: z =>
          z.string({ description: 'Git author email' }).optional(),
        forceEmptyGitAuthor: z =>
          z
            .boolean({
              description:
                'Force an empty git author (uses GitHub user as author)',
            })
            .optional(),
        createWhenEmpty: z =>
          z
            .boolean({
              description: 'Create the PR even if there are no changes',
            })
            .optional(),
      },
      output: {
        targetBranchName: z =>
          z.string({ description: 'The target branch of the pull request' }),
        remoteUrl: z =>
          z.string({ description: 'The URL of the created pull request' }),
        pullRequestNumber: z =>
          z.number({ description: 'The number of the created pull request' }),
      },
    },
    async handler(ctx) {
      const startTime = Date.now();
      const actionId = `pr-debug-${startTime}-${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const stepTimings: Record<string, number> = {};
      let lastStepTime = startTime;

      const logStep = (step: string, message: string) => {
        const now = Date.now();
        const stepDuration = now - lastStepTime;
        const totalDuration = now - startTime;
        stepTimings[step] = stepDuration;
        lastStepTime = now;
        logger.info(
          `[${actionId}] [STEP: ${step}] [+${stepDuration}ms] [total: ${totalDuration}ms] ${message}`,
        );
        ctx.logger.info(
          `[${step}] ${message} (+${stepDuration}ms, total: ${totalDuration}ms)`,
        );
      };

      const logProgress = (message: string) => {
        const totalDuration = Date.now() - startTime;
        logger.info(
          `[${actionId}] [PROGRESS] [total: ${totalDuration}ms] ${message}`,
        );
        ctx.logger.info(`${message}`);
      };

      logger.info(
        `[${actionId}] ========== DEBUG: publish:github:pull-request START ==========`,
      );
      logger.info(
        `[${actionId}] Timestamp: ${new Date(startTime).toISOString()}`,
      );
      logger.info(
        `[${actionId}] Task ID: ${ctx.templateInfo?.entityRef ?? 'unknown'}`,
      );
      logger.info(`[${actionId}] Workspace Path: ${ctx.workspacePath}`);
      ctx.logger.info(`Starting GitHub PR creation action (ID: ${actionId})`);

      logStep('INIT', 'Initialized action, parsing input parameters');

      logger.info(`[${actionId}] --- INPUT PARAMETERS ---`);
      const sanitizedInput = { ...ctx.input };
      if (sanitizedInput.token) {
        sanitizedInput.token = '[REDACTED]';
      }
      logger.info(`[${actionId}] ${JSON.stringify(sanitizedInput, null, 2)}`);

      logger.info(`[${actionId}] --- INPUT DETAILS ---`);
      logger.info(`[${actionId}] repoUrl: ${ctx.input.repoUrl}`);
      logger.info(`[${actionId}] branchName: ${ctx.input.branchName}`);
      logger.info(`[${actionId}] title: ${ctx.input.title}`);
      logger.info(
        `[${actionId}] description length: ${
          ctx.input.description?.length ?? 0
        } chars`,
      );
      logger.info(
        `[${actionId}] targetBranchName: ${
          ctx.input.targetBranchName ?? '(default)'
        }`,
      );
      logger.info(`[${actionId}] draft: ${ctx.input.draft ?? false}`);
      logger.info(
        `[${actionId}] sourcePath: ${ctx.input.sourcePath ?? '(root)'}`,
      );
      logger.info(
        `[${actionId}] targetPath: ${ctx.input.targetPath ?? '(root)'}`,
      );
      logger.info(
        `[${actionId}] reviewers: ${JSON.stringify(ctx.input.reviewers ?? [])}`,
      );
      logger.info(
        `[${actionId}] assignees: ${JSON.stringify(ctx.input.assignees ?? [])}`,
      );
      logger.info(
        `[${actionId}] teamReviewers: ${JSON.stringify(
          ctx.input.teamReviewers ?? [],
        )}`,
      );
      logger.info(
        `[${actionId}] filesToDelete: ${JSON.stringify(
          ctx.input.filesToDelete ?? [],
        )}`,
      );
      logger.info(`[${actionId}] update: ${ctx.input.update ?? false}`);
      logger.info(`[${actionId}] forceFork: ${ctx.input.forceFork ?? false}`);
      logger.info(
        `[${actionId}] createWhenEmpty: ${ctx.input.createWhenEmpty ?? false}`,
      );
      logger.info(
        `[${actionId}] gitAuthorName: ${
          ctx.input.gitAuthorName ?? '(default)'
        }`,
      );
      logger.info(
        `[${actionId}] gitAuthorEmail: ${
          ctx.input.gitAuthorEmail ?? '(default)'
        }`,
      );
      logger.info(
        `[${actionId}] forceEmptyGitAuthor: ${
          ctx.input.forceEmptyGitAuthor ?? false
        }`,
      );
      logger.info(`[${actionId}] hasToken: ${!!ctx.input.token}`);

      logStep('SCAN_SOURCE', 'Scanning source directory for files');

      const sourceDir = ctx.input.sourcePath
        ? join(ctx.workspacePath, ctx.input.sourcePath)
        : ctx.workspacePath;
      try {
        const allFiles = getFilesRecursively(sourceDir);
        const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
        logger.info(`[${actionId}] --- SOURCE PATH FILES ---`);
        logger.info(`[${actionId}] Source directory: ${sourceDir}`);
        logger.info(`[${actionId}] Total file count: ${allFiles.length}`);
        logger.info(
          `[${actionId}] Total size: ${totalSize} bytes (${(
            totalSize /
            1024 /
            1024
          ).toFixed(2)} MB)`,
        );
        logProgress(
          `Found ${allFiles.length} files (${(totalSize / 1024 / 1024).toFixed(
            2,
          )} MB total)`,
        );
        const top5BySize = allFiles.sort((a, b) => b.size - a.size).slice(0, 5);
        logger.info(`[${actionId}] Top 5 files by size:`);
        for (const file of top5BySize) {
          logger.info(`[${actionId}]   ${file.path} (${file.size} bytes)`);
        }
      } catch (fsError) {
        logger.warn(
          `[${actionId}] Could not list source path files: ${fsError}`,
        );
      }

      logProgress(
        `Creating PR "${ctx.input.title}" on branch ${ctx.input.branchName}`,
      );
      logProgress(
        `Target: ${ctx.input.repoUrl} -> ${
          ctx.input.targetBranchName ?? 'default branch'
        }`,
      );

      const {
        repoUrl,
        branchName,
        filesToDelete,
        targetBranchName,
        title,
        description,
        draft,
        targetPath,
        sourcePath,
        token: providedToken,
        reviewers,
        assignees,
        teamReviewers,
        commitMessage,
        update,
        forceFork,
        gitAuthorEmail,
        gitAuthorName,
        forceEmptyGitAuthor,
        createWhenEmpty,
      } = ctx.input;

      logStep('PARSE_URL', 'Parsing repository URL');

      const { owner, repo, host } = parseRepoUrl(repoUrl, integrations);
      if (!owner) {
        throw new InputError(
          `No owner provided for host: ${host}, and repo ${repo}`,
        );
      }

      logProgress(`Repository: ${owner}/${repo} on ${host}`);

      logStep('AUTH', 'Authenticating with GitHub');
      logger.info(`[${actionId}] --- CREATING GITHUB CLIENT ---`);
      logger.info(
        `[${actionId}] Owner: ${owner}, Repo: ${repo}, Host: ${host}`,
      );

      const clientStartTime = Date.now();
      const client = await clientFactory({
        integrations,
        githubCredentialsProvider,
        host,
        owner,
        repo,
        token: providedToken,
      });
      const clientDuration = Date.now() - clientStartTime;

      logger.info(
        `[${actionId}] GitHub client created successfully in ${clientDuration}ms`,
      );
      logStep(
        'AUTH_COMPLETE',
        `GitHub authentication successful (${clientDuration}ms)`,
      );

      logStep('RESOLVE_PATHS', 'Resolving file paths');

      const fileRoot = sourcePath
        ? resolveSafeChildPath(ctx.workspacePath, sourcePath)
        : ctx.workspacePath;

      logger.info(`[${actionId}] --- SERIALIZING DIRECTORY CONTENTS ---`);
      logger.info(`[${actionId}] File root: ${fileRoot}`);

      logStep(
        'SERIALIZE_START',
        `Serializing directory contents from ${fileRoot}`,
      );
      logProgress('Reading and encoding files for upload...');

      const serializeStartTime = Date.now();
      const directoryContents = await serializeDirectoryContents(fileRoot, {
        gitignore: true,
      });
      const serializeDuration = Date.now() - serializeStartTime;

      logger.info(
        `[${actionId}] Serialized ${directoryContents.length} files from directory in ${serializeDuration}ms`,
      );
      logStep(
        'SERIALIZE_COMPLETE',
        `Serialized ${directoryContents.length} files (${serializeDuration}ms)`,
      );

      const determineFileMode = (file: {
        symlink?: boolean;
        executable?: boolean;
      }) => {
        if (file.symlink) {
          return '120000';
        }
        if (file.executable) {
          return '100755';
        }
        return '100644';
      };

      logStep('PREPARE_FILES', 'Preparing files for GitHub API');

      const prepareStartTime = Date.now();
      let utf8Count = 0;
      let base64Count = 0;
      const files = Object.fromEntries([
        ...directoryContents.map(file => {
          const encoding = determineFileEncoding(file);
          if (encoding === 'utf-8') {
            utf8Count++;
          } else {
            base64Count++;
          }
          return [
            targetPath ? path.posix.join(targetPath, file.path) : file.path,
            {
              mode: determineFileMode(file),
              encoding,
              content: file.content.toString(encoding),
            },
          ];
        }),
        ...(filesToDelete || []).map(filePath => [
          targetPath ? path.posix.join(targetPath, filePath) : filePath,
          DELETE_FILE,
        ]),
      ]);
      logger.info(
        `[${actionId}] File encoding split: utf-8=${utf8Count}, base64=${base64Count}`,
      );
      const prepareDuration = Date.now() - prepareStartTime;

      const fileCount = Object.keys(files).length;
      const deleteCount = (filesToDelete || []).length;
      logger.info(
        `[${actionId}] Prepared ${fileCount} files for PR (${deleteCount} deletions) in ${prepareDuration}ms`,
      );
      logStep(
        'PREPARE_COMPLETE',
        `Prepared ${fileCount} files (${deleteCount} deletions, ${prepareDuration}ms)`,
      );
      logProgress(`Ready to create PR with ${fileCount} file changes`);

      if (ctx.isDryRun) {
        logStep('DRY_RUN', 'Performing dry run - no actual PR will be created');
        ctx.output('targetBranchName', branchName);
        ctx.output('remoteUrl', repoUrl);
        ctx.output('pullRequestNumber', 43);
        logProgress(
          'Dry run complete - PR would have been created successfully',
        );
        logger.info(`[${actionId}] Dry run completed`);
        return;
      }

      let error: Error | undefined;
      const outputs: Record<string, unknown> = {};

      try {
        logStep('BUILD_OPTIONS', 'Building PR creation options');
        logger.info(`[${actionId}] --- CREATING PULL REQUEST ---`);

        const createOptions: CreatePullRequestOptions = {
          owner,
          repo,
          title,
          changes: [
            {
              files,
              commit:
                commitMessage ??
                config?.getOptionalString('scaffolder.defaultCommitMessage') ??
                title,
            },
          ],
          body: description,
          head: branchName,
          draft,
          update,
          forceFork,
          createWhenEmpty,
        };

        const gitAuthorInfo = {
          name:
            gitAuthorName ??
            config?.getOptionalString('scaffolder.defaultAuthor.name'),
          email:
            gitAuthorEmail ??
            config?.getOptionalString('scaffolder.defaultAuthor.email'),
        };

        if (!forceEmptyGitAuthor) {
          if (gitAuthorInfo.name || gitAuthorInfo.email) {
            createOptions.changes = createOptions.changes.map(
              (change: PullRequestChange) => ({
                ...change,
                author: {
                  name: gitAuthorInfo.name || 'Scaffolder',
                  email: gitAuthorInfo.email || 'scaffolder@backstage.io',
                },
              }),
            );
          }
        }

        if (targetBranchName) {
          createOptions.base = targetBranchName;
        }

        logStep('API_CALL_START', 'Calling GitHub API to create pull request');
        logProgress(
          'Uploading files to GitHub and creating PR... (this may take a while for large PRs)',
        );

        logger.info(`[${actionId}] Calling client.createPullRequest...`);
        logger.info(
          `[${actionId}] Create options: ${JSON.stringify(
            {
              ...createOptions,
              changes: `[${
                (createOptions.changes as Array<unknown>).length
              } change(s)]`,
            },
            null,
            2,
          )}`,
        );

        const apiStartTime = Date.now();
        let apiCallAttempts = 0;

        const pr = await ctx.checkpoint({
          key: `create.pr.${owner}.${repo}.${branchName}`,
          fn: async () => {
            apiCallAttempts++;
            logger.info(
              `[${actionId}] GitHub API call attempt #${apiCallAttempts}`,
            );
            const response = await client.createPullRequest(createOptions);
            if (!response) {
              return null;
            }
            return {
              base: response.data.base,
              html_url: response.data.html_url,
              number: response.data.number,
            };
          },
        });

        const apiDuration = Date.now() - apiStartTime;
        logger.info(
          `[${actionId}] GitHub API call completed in ${apiDuration}ms`,
        );

        if (createWhenEmpty === false && !pr) {
          logStep('NO_CHANGES', 'No changes detected - PR was not created');
          logProgress('No changes to commit, pull request was not created');
          logger.info(
            `[${actionId}] No changes to commit, pull request was not created`,
          );
          return;
        }

        if (!pr) {
          throw new GithubResponseError('null response from Github');
        }

        logStep(
          'PR_CREATED',
          `Pull request #${pr.number} created successfully (API call: ${apiDuration}ms)`,
        );
        logProgress(`Pull request #${pr.number} created: ${pr.html_url}`);
        logger.info(`[${actionId}] Pull request created: #${pr.number}`);

        const pullRequestNumber = pr.number;
        const pullRequest = { owner, repo, number: pullRequestNumber };

        if (reviewers || teamReviewers) {
          const reviewerCount =
            (reviewers?.length ?? 0) + (teamReviewers?.length ?? 0);
          logStep('ADD_REVIEWERS', `Adding ${reviewerCount} reviewer(s) to PR`);
          logProgress(
            `Adding reviewers: ${[
              ...(reviewers ?? []),
              ...(teamReviewers ?? []),
            ].join(', ')}`,
          );
          logger.info(`[${actionId}] Adding reviewers to PR...`);
          const reviewerStartTime = Date.now();
          await requestReviewersOnPullRequest(
            pullRequest,
            reviewers,
            teamReviewers,
            client,
            ctx.logger,
            ctx.checkpoint,
            logger,
            actionId,
          );
          const reviewerDuration = Date.now() - reviewerStartTime;
          logStep('REVIEWERS_ADDED', `Reviewers added (${reviewerDuration}ms)`);
        }

        if (assignees) {
          if (assignees.length > 10) {
            ctx.logger.warn(
              'Assignees list is too long, only the first 10 will be used.',
            );
          }
          logStep(
            'ADD_ASSIGNEES',
            `Adding ${assignees.length} assignee(s) to PR`,
          );
          logProgress(`Adding assignees: ${assignees.join(', ')}`);
          logger.info(`[${actionId}] Adding assignees to PR...`);
          const assigneeStartTime = Date.now();
          await addAssigneesToPullRequest(
            pullRequest,
            assignees,
            client,
            ctx.logger,
            ctx.checkpoint,
            logger,
            actionId,
          );
          const assigneeDuration = Date.now() - assigneeStartTime;
          logStep('ASSIGNEES_ADDED', `Assignees added (${assigneeDuration}ms)`);
        }

        logStep('SET_OUTPUTS', 'Setting action outputs');

        const targetBranch = pr.base.ref;
        outputs.targetBranchName = targetBranch;
        outputs.remoteUrl = pr.html_url;
        outputs.pullRequestNumber = pullRequestNumber;

        ctx.output('targetBranchName', targetBranch);
        ctx.output('remoteUrl', pr.html_url);
        ctx.output('pullRequestNumber', pullRequestNumber);

        logStep('SUCCESS', 'Pull request action completed successfully');
        logger.info(`[${actionId}] --- ACTION SUCCEEDED ---`);
      } catch (err) {
        error = err instanceof Error ? err : new Error(String(err));
        logStep('ERROR', `Action failed: ${error.message}`);
        logger.error(`[${actionId}] --- ACTION FAILED ---`);
        logger.error(`[${actionId}] Error name: ${error.name}`);
        logger.error(`[${actionId}] Error message: ${error.message}`);
        logger.error(`[${actionId}] Error stack: ${error.stack}`);
        ctx.logger.error(`PR creation failed: ${error.message}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      logger.info(`[${actionId}] --- OUTPUT PARAMETERS ---`);
      logger.info(`[${actionId}] ${JSON.stringify(outputs, null, 2)}`);

      logger.info(`[${actionId}] --- STEP TIMINGS ---`);
      for (const [step, time] of Object.entries(stepTimings)) {
        logger.info(`[${actionId}]   ${step}: ${time}ms`);
      }

      logger.info(`[${actionId}] --- TELEMETRY ---`);
      logger.info(`[${actionId}] Duration: ${duration}ms`);
      logger.info(`[${actionId}] Success: ${!error}`);
      logger.info(`[${actionId}] Start: ${new Date(startTime).toISOString()}`);
      logger.info(`[${actionId}] End: ${new Date(endTime).toISOString()}`);

      if (!error) {
        ctx.logger.info(`Action completed successfully in ${duration}ms`);
        if (outputs.remoteUrl) {
          ctx.logger.info(`PR URL: ${outputs.remoteUrl}`);
        }
        if (outputs.pullRequestNumber) {
          ctx.logger.info(`PR Number: #${outputs.pullRequestNumber}`);
        }
      } else {
        ctx.logger.error(`Action failed after ${duration}ms`);
      }

      logger.info(
        `[${actionId}] ========== DEBUG: publish:github:pull-request END ==========`,
      );

      if (error) {
        throw new GithubResponseError('Pull request creation failed', error);
      }
    },
  });

  async function addAssigneesToPullRequest(
    pr: { owner: string; repo: string; number: number },
    assignees: string[],
    client: OctokitPRClient,
    ctxLogger: typeof logger,
    checkpoint: Parameters<typeof createTemplateAction>[0] extends {
      handler: (ctx: infer C) => unknown;
    }
      ? C extends { checkpoint: infer CP }
        ? CP
        : never
      : never,
    debugLogger: LoggerService,
    actionId: string,
  ) {
    try {
      await checkpoint({
        key: `add.assignees.${pr.owner}.${pr.repo}.${pr.number}`,
        fn: async () => {
          const result = await client.rest.issues.addAssignees({
            owner: pr.owner,
            repo: pr.repo,
            issue_number: pr.number,
            assignees,
          });
          const addedAssignees =
            result.data.assignees
              ?.map((a: { login: string }) => a.login)
              .join(', ') ?? '';
          ctxLogger.info(
            `Added assignees [${addedAssignees}] to Pull request ${pr.number}`,
          );
          debugLogger.info(
            `[${actionId}] Added assignees [${addedAssignees}] to PR #${pr.number}`,
          );
        },
      });
    } catch (e) {
      ctxLogger.error(
        `Failure when adding assignees to Pull request ${pr.number}`,
        e as Error,
      );
      debugLogger.error(
        `[${actionId}] Failure when adding assignees to PR #${pr.number}: ${e}`,
      );
    }
  }

  async function requestReviewersOnPullRequest(
    pr: { owner: string; repo: string; number: number },
    reviewers: string[] | undefined,
    teamReviewers: string[] | undefined,
    client: OctokitPRClient,
    ctxLogger: typeof logger,
    checkpoint: Parameters<typeof createTemplateAction>[0] extends {
      handler: (ctx: infer C) => unknown;
    }
      ? C extends { checkpoint: infer CP }
        ? CP
        : never
      : never,
    debugLogger: LoggerService,
    actionId: string,
  ) {
    try {
      await checkpoint({
        key: `request.reviewers.${pr.owner}.${pr.repo}.${pr.number}`,
        fn: async () => {
          const result = await client.rest.pulls.requestReviewers({
            owner: pr.owner,
            repo: pr.repo,
            pull_number: pr.number,
            reviewers,
            team_reviewers: teamReviewers
              ? [...new Set(teamReviewers)]
              : undefined,
          });
          const addedUsers =
            result.data.requested_reviewers
              ?.map((r: { login: string }) => r.login)
              .join(', ') ?? '';
          const addedTeams =
            result.data.requested_teams
              ?.map((t: { name: string }) => t.name)
              .join(', ') ?? '';
          ctxLogger.info(
            `Added users [${addedUsers}] and teams [${addedTeams}] as reviewers to Pull request ${pr.number}`,
          );
          debugLogger.info(
            `[${actionId}] Added users [${addedUsers}] and teams [${addedTeams}] as reviewers to PR #${pr.number}`,
          );
        },
      });
    } catch (e) {
      ctxLogger.error(
        `Failure when adding reviewers to Pull request ${pr.number}`,
        e as Error,
      );
      debugLogger.error(
        `[${actionId}] Failure when adding reviewers to PR #${pr.number}: ${e}`,
      );
    }
  }
}
