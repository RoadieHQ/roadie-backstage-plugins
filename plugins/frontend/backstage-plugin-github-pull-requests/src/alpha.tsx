import {
  ApiBlueprint,
  configApiRef,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import { scmAuthApiRef } from '@backstage/integration-react';
import { githubPullRequestsApiRef, GithubPullRequestsClient } from './api';

const githubPullRequestsApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: githubPullRequestsApiRef,
      deps: {
        configApi: configApiRef,
        scmAuthApi: scmAuthApiRef,
      },
      factory: ({ configApi, scmAuthApi }) =>
        new GithubPullRequestsClient({ configApi, scmAuthApi }),
    }),
});

export default createFrontendPlugin({
  pluginId: 'github-pull-requests',
  extensions: [githubPullRequestsApi],
});
