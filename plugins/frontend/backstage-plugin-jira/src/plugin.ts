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

import {
  configApiRef,
  createPlugin,
  createApiFactory,
  discoveryApiRef,
  createComponentExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { createCardExtension } from '@backstage/plugin-home-react';

import { jiraApiRef, JiraAPI } from './api';

export const jiraPlugin = createPlugin({
  id: 'jira',
  apis: [
    createApiFactory({
      api: jiraApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, configApi, fetchApi }) => {
        return new JiraAPI({
          discoveryApi,
          configApi,
          fetchApi,
        });
      },
    }),
  ],
  featureFlags: [
    {
      name: 'jira-show-linked-prs',
    },
  ],
});

export const EntityJiraOverviewCard = jiraPlugin.provide(
  createComponentExtension({
    name: 'EntityJiraOverviewCard',
    component: {
      lazy: () =>
        import('./components/JiraOverviewCard').then(m => m.JiraOverviewCard),
    },
  }),
);

export const EntityJiraActivityStreamCard = jiraPlugin.provide(
  createComponentExtension({
    name: 'EntityJiraActivityStreamCard',
    component: {
      lazy: () =>
        import('./components/EntityJiraActivityStreamCard').then(
          m => m.EntityJiraActivityStreamCard,
        ),
    },
  }),
);

export const EntityJiraQueryCard = jiraPlugin.provide(
  createComponentExtension({
    name: 'EntityJiraQueryCard',
    component: {
      lazy: () =>
        import('./components/EntityJiraQueryCard').then(
          m => m.EntityJiraQueryCard,
        ),
    },
  }),
);

export const HomePageMyJiraTicketsCard = jiraPlugin.provide(
  createCardExtension<{ userId: string }>({
    name: 'My Jira Tickets',
    components: () => import('./components/Home/MyJiraTicketsCard'),
    description: 'My Jira tickets Card',
  }),
);
