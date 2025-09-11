import { ApiBlueprint, configApiRef } from '@backstage/frontend-plugin-api';
import { scmAuthApiRef } from '@backstage/integration-react';
import { githubPullRequestsApiRef, GithubPullRequestsClient } from '../api';

/**
 * @alpha
 */
export const githubPullRequestsApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: githubPullRequestsApiRef,
      deps: { configApi: configApiRef, scmAuthApi: scmAuthApiRef },
      factory({ configApi, scmAuthApi }) {
        return new GithubPullRequestsClient({ configApi, scmAuthApi });
      },
    }),
});
