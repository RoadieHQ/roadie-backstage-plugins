import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { githubPullRequestsApi } from './apis';
import { githubPullRequestsEntityCard } from './entityCards';
import { githubPullRequestsEntityContent } from './entityContents';

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'github-pull-requests',
  extensions: [
    githubPullRequestsApi,
    githubPullRequestsEntityCard,
    githubPullRequestsEntityContent,
  ],
});
