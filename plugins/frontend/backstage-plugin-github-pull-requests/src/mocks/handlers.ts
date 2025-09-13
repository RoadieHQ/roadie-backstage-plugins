/*
 * Copyright 2021 Larder Software Limited
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

import { rest } from 'msw';
import {
  openPullsRequestMock,
  requestedReviewsMock,
  requestedReviewsCustomQueryMock,
  repoMock,
  marketingSiteMock,
  yourOpenPullRequests,
  yourOpenDraftPullRequests,
  closedPullsRequestMock,
  backstagePluginArgoCdMocks,
  backstagePluginArgoCdCommitMocks,
  groupAssignedReviewsMock,
} from './mocks';

export const handlers = [
  rest.get('https://api.github.com/search/issues', (req, res, ctx) => {
    const query = req.url.searchParams.get('q');
    switch (query) {
      case 'is:open is:pr review-requested:@me archived:false':
        return res(ctx.json(requestedReviewsMock));
      case 'is:open is:pr review-requested:@me archived:false is:draft':
        return res(ctx.json(requestedReviewsCustomQueryMock));
      case 'is:open is:pr author:@me archived:false':
        return res(ctx.json(yourOpenPullRequests));
      case 'is:open is:pr author@me archived: false is:draft':
        return res(ctx.json(yourOpenDraftPullRequests));
      case 'state:closed in:title type:pr repo:RoadieHQ/backstage-plugin-argo-cd':
        return res(ctx.json(closedPullsRequestMock));
      case 'is:open is:pr team-review-requested:rroadie-backstage-admin archived:false':
        return res(ctx.json(groupAssignedReviewsMock));
      default:
        return res(ctx.json(openPullsRequestMock));
    }
  }),
  rest.get(
    'https://api.github.com/repos/RoadieHQ/roadie-backstage-plugins',
    (_, res, ctx) => {
      return res(ctx.json(repoMock));
    },
  ),
  rest.get(
    'https://api.github.com/repos/RoadieHQ/marketing-site',
    (_, res, ctx) => {
      return res(ctx.json(marketingSiteMock));
    },
  ),
  rest.get(
    'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/:pullRequestId',
    (req, res, ctx) => {
      const { pullRequestId } = req.params as { pullRequestId: string };
      return res(ctx.json(backstagePluginArgoCdMocks[pullRequestId]));
    },
  ),
  rest.get(
    'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/:pullRequestId/commits',
    (req, res, ctx) => {
      const { pullRequestId } = req.params as { pullRequestId: string };
      return res(
        ctx.json(backstagePluginArgoCdCommitMocks[pullRequestId] ?? []),
      );
    },
  ),
];
