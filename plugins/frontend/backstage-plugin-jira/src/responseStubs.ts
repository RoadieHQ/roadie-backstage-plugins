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


export const entityStub = {
  metadata: {
    namespace: 'default',
    annotations: {
      'backstage.io/managed-by-location':
        'url:https://github.com/mcalus3/sample-service/blob/master/backstage3.yaml',
      'jira/project-key': 'BT',
      'jira/component': 'testComponent',
    },
    name: 'sample-service',
    description:
      'A service for testing Backstage functionality. For example, we can trigger errors\non the sample-service, these are sent to Sentry, then we can view them in the \nBackstage plugin for Sentry.\n',
    uid: 'f099312c-9559-4197-bf06-03740e9a7554',
    etag: 'YmYyZDhlYzMtMjA1Ny00ODQwLTg4NzAtNzY3MTg4ZmJkYzg0',
    generation: 1,
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  spec: {
    type: 'service',
    owner: 'david@roadie.io',
    lifecycle: 'experimental',
  },
};

export const projectResponseStub = {
  expand: 'description,lead,issueTypes,url,projectKeys,permissions,insight',
  self: 'https://backstage-test.atlassian.net/rest/api/2/project/10000',
  id: '10000',
  key: 'BT',
  description: '',
  lead: {
    self:
      'https://backstage-test.atlassian.net/rest/api/2/user?accountId=5f42b4ae347294003e51f83e',
    accountId: '5f42b4ae347294003e51f83e',
    avatarUrls: {
      '48x48':
        'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48',
      '24x24':
        'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/24',
      '16x16':
        'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/16',
      '32x32':
        'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/32',
    },
    displayName: 'Marek Całus',
    active: true,
  },
  components: [
    {
      self: 'https://backstage-test.atlassian.net/rest/api/2/component/10000',
      id: '10000',
      name: 'testComponent',
      description: 'test component',
      isAssigneeTypeValid: false,
    },
  ],
  issueTypes: [
    {
      self: 'https://backstage-test.atlassian.net/rest/api/2/issuetype/10002',
      id: '10002',
      description: 'A small, distinct piece of work.',
      iconUrl:
        'https://backstage-test.atlassian.net/secure/viewavatar?size=medium&avatarId=10318&avatarType=issuetype',
      name: 'Task',
      subtask: false,
      avatarId: 10318,
    },
    {
      self: 'https://backstage-test.atlassian.net/rest/api/2/issuetype/10003',
      id: '10003',
      description: "A small piece of work that's part of a larger task.",
      iconUrl:
        'https://backstage-test.atlassian.net/secure/viewavatar?size=medium&avatarId=10316&avatarType=issuetype',
      name: 'Sub-task',
      subtask: true,
      avatarId: 10316,
    },
    {
      self: 'https://backstage-test.atlassian.net/rest/api/2/issuetype/10001',
      id: '10001',
      description: 'Functionality or a feature expressed as a user goal.',
      iconUrl:
        'https://backstage-test.atlassian.net/secure/viewavatar?size=medium&avatarId=10315&avatarType=issuetype',
      name: 'Story',
      subtask: false,
      avatarId: 10315,
    },
    {
      self: 'https://backstage-test.atlassian.net/rest/api/2/issuetype/10004',
      id: '10004',
      description: 'A problem or error.',
      iconUrl:
        'https://backstage-test.atlassian.net/secure/viewavatar?size=medium&avatarId=10303&avatarType=issuetype',
      name: 'Bug',
      subtask: false,
      avatarId: 10303,
    },
    {
      self: 'https://backstage-test.atlassian.net/rest/api/2/issuetype/10000',
      id: '10000',
      description:
        'A big user story that needs to be broken down. Created by Jira Software - do not edit or delete.',
      iconUrl:
        'https://backstage-test.atlassian.net/images/icons/issuetypes/epic.svg',
      name: 'Epic',
      subtask: false,
    },
  ],
  assigneeType: 'UNASSIGNED',
  versions: [],
  name: 'backstage-test',
  roles: {
    'atlassian-addons-project-access':
      'https://backstage-test.atlassian.net/rest/api/2/project/10000/role/10003',
    Administrators:
      'https://backstage-test.atlassian.net/rest/api/2/project/10000/role/10002',
  },
  avatarUrls: {
    '48x48':
      'https://backstage-test.atlassian.net/secure/projectavatar?pid=10000&avatarId=10401',
    '24x24':
      'https://backstage-test.atlassian.net/secure/projectavatar?size=small&s=small&pid=10000&avatarId=10401',
    '16x16':
      'https://backstage-test.atlassian.net/secure/projectavatar?size=xsmall&s=xsmall&pid=10000&avatarId=10401',
    '32x32':
      'https://backstage-test.atlassian.net/secure/projectavatar?size=medium&s=medium&pid=10000&avatarId=10401',
  },
  projectTypeKey: 'software',
  simplified: false,
  style: 'classic',
  isPrivate: false,
  properties: {},
};

export const searchResponseStub = {
  startAt: 0,
  maxResults: 50,
  total: 1,
  issues: [
    {
      self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10003',
      id: '10003',
      key: '10003',
      fields: {
        issuetype: {
          id: 1,
          name: 'Task',
          iconUrl: 'http://example.com/avatar.jpg',
        },
      },
    }
  ],
};

export const statusesResponseStub = [
  {
    self:
      'https://backstage-test.atlassian.net/rest/api/latest/issuetype/10002',
    id: '10002',
    name: 'Task',
    subtask: false,
    statuses: [
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10000',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Backlog',
        untranslatedName: 'Backlog',
        id: '10000',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/2',
          id: 2,
          key: 'new',
          colorName: 'blue-gray',
          name: 'To Do',
        },
      },
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10001',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Selected for Development',
        untranslatedName: 'Selected for Development',
        id: '10001',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/2',
          id: 2,
          key: 'new',
          colorName: 'blue-gray',
          name: 'To Do',
        },
      },
      {
        self: 'https://backstage-test.atlassian.net/rest/api/latest/status/3',
        description:
          'This issue is being actively worked on at the moment by the assignee.',
        iconUrl:
          'https://backstage-test.atlassian.net/images/icons/statuses/inprogress.png',
        name: 'In Progress',
        untranslatedName: 'In Progress',
        id: '3',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/4',
          id: 4,
          key: 'indeterminate',
          colorName: 'yellow',
          name: 'In Progress',
        },
      },
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10002',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Done',
        untranslatedName: 'Done',
        id: '10002',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/3',
          id: 3,
          key: 'done',
          colorName: 'green',
          name: 'Done',
        },
      },
    ],
  },
  {
    self:
      'https://backstage-test.atlassian.net/rest/api/latest/issuetype/10003',
    id: '10003',
    name: 'Sub-task',
    subtask: true,
    statuses: [
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10000',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Backlog',
        untranslatedName: 'Backlog',
        id: '10000',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/2',
          id: 2,
          key: 'new',
          colorName: 'blue-gray',
          name: 'To Do',
        },
      },
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10001',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Selected for Development',
        untranslatedName: 'Selected for Development',
        id: '10001',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/2',
          id: 2,
          key: 'new',
          colorName: 'blue-gray',
          name: 'To Do',
        },
      },
      {
        self: 'https://backstage-test.atlassian.net/rest/api/latest/status/3',
        description:
          'This issue is being actively worked on at the moment by the assignee.',
        iconUrl:
          'https://backstage-test.atlassian.net/images/icons/statuses/inprogress.png',
        name: 'In Progress',
        untranslatedName: 'In Progress',
        id: '3',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/4',
          id: 4,
          key: 'indeterminate',
          colorName: 'yellow',
          name: 'In Progress',
        },
      },
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10002',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Done',
        untranslatedName: 'Done',
        id: '10002',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/3',
          id: 3,
          key: 'done',
          colorName: 'green',
          name: 'Done',
        },
      },
    ],
  },
  {
    self:
      'https://backstage-test.atlassian.net/rest/api/latest/issuetype/10001',
    id: '10001',
    name: 'Story',
    subtask: false,
    statuses: [
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10000',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Backlog',
        untranslatedName: 'Backlog',
        id: '10000',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/2',
          id: 2,
          key: 'new',
          colorName: 'blue-gray',
          name: 'To Do',
        },
      },
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10001',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Selected for Development',
        untranslatedName: 'Selected for Development',
        id: '10001',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/2',
          id: 2,
          key: 'new',
          colorName: 'blue-gray',
          name: 'To Do',
        },
      },
      {
        self: 'https://backstage-test.atlassian.net/rest/api/latest/status/3',
        description:
          'This issue is being actively worked on at the moment by the assignee.',
        iconUrl:
          'https://backstage-test.atlassian.net/images/icons/statuses/inprogress.png',
        name: 'In Progress',
        untranslatedName: 'In Progress',
        id: '3',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/4',
          id: 4,
          key: 'indeterminate',
          colorName: 'yellow',
          name: 'In Progress',
        },
      },
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10002',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Done',
        untranslatedName: 'Done',
        id: '10002',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/3',
          id: 3,
          key: 'done',
          colorName: 'green',
          name: 'Done',
        },
      },
    ],
  },
  {
    self:
      'https://backstage-test.atlassian.net/rest/api/latest/issuetype/10004',
    id: '10004',
    name: 'Bug',
    subtask: false,
    statuses: [
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10000',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Backlog',
        untranslatedName: 'Backlog',
        id: '10000',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/2',
          id: 2,
          key: 'new',
          colorName: 'blue-gray',
          name: 'To Do',
        },
      },
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10001',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Selected for Development',
        untranslatedName: 'Selected for Development',
        id: '10001',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/2',
          id: 2,
          key: 'new',
          colorName: 'blue-gray',
          name: 'To Do',
        },
      },
      {
        self: 'https://backstage-test.atlassian.net/rest/api/latest/status/3',
        description:
          'This issue is being actively worked on at the moment by the assignee.',
        iconUrl:
          'https://backstage-test.atlassian.net/images/icons/statuses/inprogress.png',
        name: 'In Progress',
        untranslatedName: 'In Progress',
        id: '3',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/4',
          id: 4,
          key: 'indeterminate',
          colorName: 'yellow',
          name: 'In Progress',
        },
      },
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10002',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Done',
        untranslatedName: 'Done',
        id: '10002',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/3',
          id: 3,
          key: 'done',
          colorName: 'green',
          name: 'Done',
        },
      },
    ],
  },
  {
    self:
      'https://backstage-test.atlassian.net/rest/api/latest/issuetype/10000',
    id: '10000',
    name: 'Epic',
    subtask: false,
    statuses: [
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10000',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Backlog',
        untranslatedName: 'Backlog',
        id: '10000',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/2',
          id: 2,
          key: 'new',
          colorName: 'blue-gray',
          name: 'To Do',
        },
      },
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10001',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Selected for Development',
        untranslatedName: 'Selected for Development',
        id: '10001',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/2',
          id: 2,
          key: 'new',
          colorName: 'blue-gray',
          name: 'To Do',
        },
      },
      {
        self: 'https://backstage-test.atlassian.net/rest/api/latest/status/3',
        description:
          'This issue is being actively worked on at the moment by the assignee.',
        iconUrl:
          'https://backstage-test.atlassian.net/images/icons/statuses/inprogress.png',
        name: 'In Progress',
        untranslatedName: 'In Progress',
        id: '3',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/4',
          id: 4,
          key: 'indeterminate',
          colorName: 'yellow',
          name: 'In Progress',
        },
      },
      {
        self:
          'https://backstage-test.atlassian.net/rest/api/latest/status/10002',
        description: '',
        iconUrl: 'https://backstage-test.atlassian.net/',
        name: 'Done',
        untranslatedName: 'Done',
        id: '10002',
        statusCategory: {
          self:
            'https://backstage-test.atlassian.net/rest/api/latest/statuscategory/3',
          id: 3,
          key: 'done',
          colorName: 'green',
          name: 'Done',
        },
      },
    ],
  },
];

export const activityResponseStub = `<feed xmlns="http://www.w3.org/2005/Atom" xmlns:atlassian="http://streams.atlassian.com/syndication/general/1.0"><id>https://backstage-test.atlassian.net/activity?maxResults=25&amp;streams=key+IS+BT&amp;os_authType=basic</id><link href="https://backstage-test.atlassian.net/activity?maxResults=25&amp;streams=key+IS+BT&amp;os_authType=basic" rel="self" /><title type="text">Activity Streams</title><atlassian:timezone-offset>+0100</atlassian:timezone-offset><updated>2021-01-08T08:44:59.821Z</updated><entry xmlns:activity="http://activitystrea.ms/spec/1.0/"><id>urn:uuid:70dd89c9-afe3-3ca4-9035-3e64aae0817c</id><title type="html">&lt;a href="https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;amp;streamsSourceProduct=jira" class="activity-item-user activity-item-author">Marek Całus&lt;/a> created       &lt;a href="https://backstage-test.atlassian.net/browse/BT-5?streamsSourceProduct=jira">BT-5 - test task 3&lt;/a>
</title><content type="html">&lt;div class="user-content">    &lt;/div> </content><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name>Marek Całus</name><email>marek.calus@withintent.com</email><uri>https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;streamsSourceProduct=jira</uri><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=48" media:height="48" media:width="48" /><usr:username>ug:08129a54-b087-4f13-8cc2-ef00a3a38f4d</usr:username><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2020-12-09T20:20:43.318Z</published><updated>2020-12-09T20:20:43.318Z</updated><category term="created" /><link href="https://backstage-test.atlassian.net/browse/BT-5?streamsSourceProduct=jira" rel="alternate" /><link href="https://backstage-test.atlassian.net/secure/viewavatar?size=medium&amp;avatarId=10318&amp;avatarType=issuetype&amp;streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/icon" title="Task" /><link href="https://backstage-test.atlassian.net/s/o2joag/b/24/8dc2987eee643c42b3231307f485e5d192007d2c/_/download/resources/jira.webresources:global-static/wiki-renderer.css?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test.atlassian.net/plugins/servlet/streamscomments/issues/BT-5?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/reply-to" /><generator uri="https://backstage-test.atlassian.net" /><atlassian:application>com.atlassian.jira</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/post</activity:verb><activity:object><id>urn:uuid:70dd89c9-afe3-3ca4-9035-3e64aae0817c</id><title type="text">BT-5</title><summary type="text">test task 3</summary><link rel="alternate" href="https://backstage-test.atlassian.net/browse/BT-5?streamsSourceProduct=jira" /><activity:object-type>http://streams.atlassian.com/syndication/types/issue</activity:object-type></activity:object><atlassian:timezone-offset>+0100</atlassian:timezone-offset></entry><entry xmlns:activity="http://activitystrea.ms/spec/1.0/"><id>urn:uuid:f0d1cc96-0f37-378f-8903-a12049d2d34d</id><title type="html">&lt;a href="https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;amp;streamsSourceProduct=jira" class="activity-item-user activity-item-author">Marek Całus&lt;/a> created       &lt;a href="https://backstage-test.atlassian.net/browse/BT-4?streamsSourceProduct=jira">BT-4 - test story&lt;/a>
</title><content type="html">&lt;div class="user-content">    &lt;/div> </content><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name>Marek Całus</name><email>marek.calus@withintent.com</email><uri>https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;streamsSourceProduct=jira</uri><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=48" media:height="48" media:width="48" /><usr:username>ug:08129a54-b087-4f13-8cc2-ef00a3a38f4d</usr:username><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2020-12-09T20:20:20.270Z</published><updated>2020-12-09T20:20:20.270Z</updated><category term="created" /><link href="https://backstage-test.atlassian.net/browse/BT-4?streamsSourceProduct=jira" rel="alternate" /><link href="https://backstage-test.atlassian.net/secure/viewavatar?size=medium&amp;avatarId=10315&amp;avatarType=issuetype&amp;streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/icon" title="Story" /><link href="https://backstage-test.atlassian.net/s/o2joag/b/24/8dc2987eee643c42b3231307f485e5d192007d2c/_/download/resources/jira.webresources:global-static/wiki-renderer.css?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test.atlassian.net/plugins/servlet/streamscomments/issues/BT-4?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/reply-to" /><generator uri="https://backstage-test.atlassian.net" /><atlassian:application>com.atlassian.jira</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/post</activity:verb><activity:object><id>urn:uuid:f0d1cc96-0f37-378f-8903-a12049d2d34d</id><title type="text">BT-4</title><summary type="text">test story</summary><link rel="alternate" href="https://backstage-test.atlassian.net/browse/BT-4?streamsSourceProduct=jira" /><activity:object-type>http://streams.atlassian.com/syndication/types/issue</activity:object-type></activity:object><atlassian:timezone-offset>+0100</atlassian:timezone-offset></entry><entry xmlns:activity="http://activitystrea.ms/spec/1.0/"><id>urn:uuid:ba005d10-e1c0-3ac7-ada1-1acdcdacc215</id><title type="html">&lt;a href="https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;amp;streamsSourceProduct=jira" class="activity-item-user activity-item-author">Marek Całus&lt;/a> added the Component '&lt;a href="https://backstage-test.atlassian.net/browse/BT/component/10000">testComponent&lt;/a>' to       &lt;a href="https://backstage-test.atlassian.net/browse/BT-1?streamsSourceProduct=jira">BT-1 - Test task&lt;/a>
</title><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name>Marek Całus</name><email>marek.calus@withintent.com</email><uri>https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;streamsSourceProduct=jira</uri><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=48" media:height="48" media:width="48" /><usr:username>ug:08129a54-b087-4f13-8cc2-ef00a3a38f4d</usr:username><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2020-12-09T20:20:04.702Z</published><updated>2020-12-09T20:20:04.702Z</updated><link href="https://backstage-test.atlassian.net/browse/BT-1?streamsSourceProduct=jira" rel="alternate" /><link href="https://backstage-test.atlassian.net/secure/viewavatar?size=medium&amp;avatarId=10315&amp;avatarType=issuetype&amp;streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/icon" title="Story" /><link href="https://backstage-test.atlassian.net/s/o2joag/b/24/8dc2987eee643c42b3231307f485e5d192007d2c/_/download/resources/jira.webresources:global-static/wiki-renderer.css?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test.atlassian.net/plugins/servlet/streamscomments/issues/BT-1?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/reply-to" /><generator uri="https://backstage-test.atlassian.net" /><atlassian:application>com.atlassian.jira</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/update</activity:verb><activity:object><id>urn:uuid:9fbeac3f-fc71-3de3-ada0-91afab49b311</id><title type="text">BT-1</title><summary type="text">Test task</summary><link rel="alternate" href="https://backstage-test.atlassian.net/browse/BT-1?streamsSourceProduct=jira" /><activity:object-type>http://streams.atlassian.com/syndication/types/issue</activity:object-type></activity:object><atlassian:timezone-offset>+0100</atlassian:timezone-offset></entry><entry xmlns:activity="http://activitystrea.ms/spec/1.0/"><id>urn:uuid:6b0321b7-cbd2-3d26-b3f5-ecb9765045f9</id><title type="html">&lt;a href="https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;amp;streamsSourceProduct=jira" class="activity-item-user activity-item-author">Marek Całus&lt;/a> added the Component '&lt;a href="https://backstage-test.atlassian.net/browse/BT/component/10000">testComponent&lt;/a>' to       &lt;a href="https://backstage-test.atlassian.net/browse/BT-2?streamsSourceProduct=jira">BT-2 - Test task 2&lt;/a>
</title><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name>Marek Całus</name><email>marek.calus@withintent.com</email><uri>https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;streamsSourceProduct=jira</uri><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=48" media:height="48" media:width="48" /><usr:username>ug:08129a54-b087-4f13-8cc2-ef00a3a38f4d</usr:username><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2020-12-09T19:27:10.056Z</published><updated>2020-12-09T19:27:10.056Z</updated><link href="https://backstage-test.atlassian.net/browse/BT-2?streamsSourceProduct=jira" rel="alternate" /><link href="https://backstage-test.atlassian.net/secure/viewavatar?size=medium&amp;avatarId=10315&amp;avatarType=issuetype&amp;streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/icon" title="Story" /><link href="https://backstage-test.atlassian.net/s/o2joag/b/24/8dc2987eee643c42b3231307f485e5d192007d2c/_/download/resources/jira.webresources:global-static/wiki-renderer.css?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test.atlassian.net/plugins/servlet/streamscomments/issues/BT-2?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/reply-to" /><generator uri="https://backstage-test.atlassian.net" /><atlassian:application>com.atlassian.jira</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/update</activity:verb><activity:object><id>urn:uuid:fcabd4e8-de67-3f13-ad08-9a77e2a87830</id><title type="text">BT-2</title><summary type="text">Test task 2</summary><link rel="alternate" href="https://backstage-test.atlassian.net/browse/BT-2?streamsSourceProduct=jira" /><activity:object-type>http://streams.atlassian.com/syndication/types/issue</activity:object-type></activity:object><atlassian:timezone-offset>+0100</atlassian:timezone-offset></entry><entry xmlns:activity="http://activitystrea.ms/spec/1.0/"><id>urn:uuid:c302c66d-406a-3582-8102-8f12cdc1b017</id><title type="html">&lt;a href="https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;amp;streamsSourceProduct=jira" class="activity-item-user activity-item-author">Marek Całus&lt;/a> added the Component '&lt;a href="https://backstage-test.atlassian.net/browse/BT/component/10000">testComponent&lt;/a>' to       &lt;a href="https://backstage-test.atlassian.net/browse/BT-3?streamsSourceProduct=jira">BT-3 - Test bug&lt;/a>
</title><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name>Marek Całus</name><email>marek.calus@withintent.com</email><uri>https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;streamsSourceProduct=jira</uri><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=48" media:height="48" media:width="48" /><usr:username>ug:08129a54-b087-4f13-8cc2-ef00a3a38f4d</usr:username><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2020-12-09T19:26:54.765Z</published><updated>2020-12-09T19:26:54.765Z</updated><link href="https://backstage-test.atlassian.net/browse/BT-3?streamsSourceProduct=jira" rel="alternate" /><link href="https://backstage-test.atlassian.net/secure/viewavatar?size=medium&amp;avatarId=10303&amp;avatarType=issuetype&amp;streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/icon" title="Bug" /><link href="https://backstage-test.atlassian.net/s/o2joag/b/24/8dc2987eee643c42b3231307f485e5d192007d2c/_/download/resources/jira.webresources:global-static/wiki-renderer.css?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test.atlassian.net/plugins/servlet/streamscomments/issues/BT-3?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/reply-to" /><generator uri="https://backstage-test.atlassian.net" /><atlassian:application>com.atlassian.jira</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/update</activity:verb><activity:object><id>urn:uuid:1d1d4fc9-e33e-3fdf-a1b3-7bcd48f8e834</id><title type="text">BT-3</title><summary type="text">Test bug</summary><link rel="alternate" href="https://backstage-test.atlassian.net/browse/BT-3?streamsSourceProduct=jira" /><activity:object-type>http://streams.atlassian.com/syndication/types/issue</activity:object-type></activity:object><atlassian:timezone-offset>+0100</atlassian:timezone-offset></entry><entry xmlns:activity="http://activitystrea.ms/spec/1.0/"><id>urn:uuid:c069033a-9c93-3664-9fc0-8c5a8cda3784</id><title type="html">&lt;a href="https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;amp;streamsSourceProduct=jira" class="activity-item-user activity-item-author">Marek Całus&lt;/a> started progress on       &lt;a href="https://backstage-test.atlassian.net/browse/BT-3?streamsSourceProduct=jira">BT-3 - Test bug&lt;/a>
</title><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name>Marek Całus</name><email>marek.calus@withintent.com</email><uri>https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;streamsSourceProduct=jira</uri><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=48" media:height="48" media:width="48" /><usr:username>ug:08129a54-b087-4f13-8cc2-ef00a3a38f4d</usr:username><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2020-12-08T19:37:02.463Z</published><updated>2020-12-08T19:37:02.463Z</updated><category term="started" /><link href="https://backstage-test.atlassian.net/browse/BT-3?streamsSourceProduct=jira" rel="alternate" /><link href="https://backstage-test.atlassian.net/secure/viewavatar?size=medium&amp;avatarId=10303&amp;avatarType=issuetype&amp;streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/icon" title="Bug" /><link href="https://backstage-test.atlassian.net/s/o2joag/b/24/8dc2987eee643c42b3231307f485e5d192007d2c/_/download/resources/jira.webresources:global-static/wiki-renderer.css?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test.atlassian.net/plugins/servlet/streamscomments/issues/BT-3?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/reply-to" /><generator uri="https://backstage-test.atlassian.net" /><atlassian:application>com.atlassian.jira</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/update</activity:verb><activity:verb>http://streams.atlassian.com/syndication/verbs/jira/transition</activity:verb><activity:verb>http://streams.atlassian.com/syndication/verbs/jira/start</activity:verb><activity:object><id>urn:uuid:1d1d4fc9-e33e-3fdf-a1b3-7bcd48f8e834</id><title type="text">BT-3</title><summary type="text">Test bug</summary><link rel="alternate" href="https://backstage-test.atlassian.net/browse/BT-3?streamsSourceProduct=jira" /><activity:object-type>http://streams.atlassian.com/syndication/types/issue</activity:object-type></activity:object><atlassian:timezone-offset>+0100</atlassian:timezone-offset></entry><entry xmlns:activity="http://activitystrea.ms/spec/1.0/"><id>urn:uuid:6cac35ef-1610-3263-a898-9c77b838e963</id><title type="html">&lt;a href="https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;amp;streamsSourceProduct=jira" class="activity-item-user activity-item-author">Marek Całus&lt;/a> changed the status to Selected for Development on       &lt;a href="https://backstage-test.atlassian.net/browse/BT-2?streamsSourceProduct=jira">BT-2 - Test task 2&lt;/a>
</title><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name>Marek Całus</name><email>marek.calus@withintent.com</email><uri>https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;streamsSourceProduct=jira</uri><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=48" media:height="48" media:width="48" /><usr:username>ug:08129a54-b087-4f13-8cc2-ef00a3a38f4d</usr:username><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2020-12-08T19:37:01.367Z</published><updated>2020-12-08T19:37:01.367Z</updated><category term="Selected for Development" /><link href="https://backstage-test.atlassian.net/browse/BT-2?streamsSourceProduct=jira" rel="alternate" /><link href="https://backstage-test.atlassian.net/secure/viewavatar?size=medium&amp;avatarId=10315&amp;avatarType=issuetype&amp;streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/icon" title="Story" /><link href="https://backstage-test.atlassian.net/s/o2joag/b/24/8dc2987eee643c42b3231307f485e5d192007d2c/_/download/resources/jira.webresources:global-static/wiki-renderer.css?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test.atlassian.net/plugins/servlet/streamscomments/issues/BT-2?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/reply-to" /><generator uri="https://backstage-test.atlassian.net" /><atlassian:application>com.atlassian.jira</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/update</activity:verb><activity:verb>http://streams.atlassian.com/syndication/verbs/jira/transition</activity:verb><activity:object><id>urn:uuid:fcabd4e8-de67-3f13-ad08-9a77e2a87830</id><title type="text">BT-2</title><summary type="text">Test task 2</summary><link rel="alternate" href="https://backstage-test.atlassian.net/browse/BT-2?streamsSourceProduct=jira" /><activity:object-type>http://streams.atlassian.com/syndication/types/issue</activity:object-type></activity:object><atlassian:timezone-offset>+0100</atlassian:timezone-offset></entry><entry xmlns:activity="http://activitystrea.ms/spec/1.0/"><id>urn:uuid:1d1d4fc9-e33e-3fdf-a1b3-7bcd48f8e834</id><title type="html">&lt;a href="https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;amp;streamsSourceProduct=jira" class="activity-item-user activity-item-author">Marek Całus&lt;/a> created       &lt;a href="https://backstage-test.atlassian.net/browse/BT-3?streamsSourceProduct=jira">BT-3 - Test bug&lt;/a>
</title><content type="html">&lt;div class="user-content">    &lt;/div> </content><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name>Marek Całus</name><email>marek.calus@withintent.com</email><uri>https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;streamsSourceProduct=jira</uri><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=48" media:height="48" media:width="48" /><usr:username>ug:08129a54-b087-4f13-8cc2-ef00a3a38f4d</usr:username><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2020-12-08T19:36:58.851Z</published><updated>2020-12-08T19:36:58.851Z</updated><category term="created" /><link href="https://backstage-test.atlassian.net/browse/BT-3?streamsSourceProduct=jira" rel="alternate" /><link href="https://backstage-test.atlassian.net/secure/viewavatar?size=medium&amp;avatarId=10303&amp;avatarType=issuetype&amp;streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/icon" title="Bug" /><link href="https://backstage-test.atlassian.net/s/o2joag/b/24/8dc2987eee643c42b3231307f485e5d192007d2c/_/download/resources/jira.webresources:global-static/wiki-renderer.css?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test.atlassian.net/plugins/servlet/streamscomments/issues/BT-3?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/reply-to" /><generator uri="https://backstage-test.atlassian.net" /><atlassian:application>com.atlassian.jira</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/post</activity:verb><activity:object><id>urn:uuid:1d1d4fc9-e33e-3fdf-a1b3-7bcd48f8e834</id><title type="text">BT-3</title><summary type="text">Test bug</summary><link rel="alternate" href="https://backstage-test.atlassian.net/browse/BT-3?streamsSourceProduct=jira" /><activity:object-type>http://streams.atlassian.com/syndication/types/issue</activity:object-type></activity:object><atlassian:timezone-offset>+0100</atlassian:timezone-offset></entry><entry xmlns:activity="http://activitystrea.ms/spec/1.0/"><id>urn:uuid:fcabd4e8-de67-3f13-ad08-9a77e2a87830</id><title type="html">&lt;a href="https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;amp;streamsSourceProduct=jira" class="activity-item-user activity-item-author">Marek Całus&lt;/a> created       &lt;a href="https://backstage-test.atlassian.net/browse/BT-2?streamsSourceProduct=jira">BT-2 - Test task 2&lt;/a>
</title><content type="html">&lt;div class="user-content">    &lt;/div> </content><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name>Marek Całus</name><email>marek.calus@withintent.com</email><uri>https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;streamsSourceProduct=jira</uri><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=48" media:height="48" media:width="48" /><usr:username>ug:08129a54-b087-4f13-8cc2-ef00a3a38f4d</usr:username><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2020-12-08T19:36:41.763Z</published><updated>2020-12-08T19:36:41.763Z</updated><category term="created" /><link href="https://backstage-test.atlassian.net/browse/BT-2?streamsSourceProduct=jira" rel="alternate" /><link href="https://backstage-test.atlassian.net/secure/viewavatar?size=medium&amp;avatarId=10315&amp;avatarType=issuetype&amp;streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/icon" title="Story" /><link href="https://backstage-test.atlassian.net/s/o2joag/b/24/8dc2987eee643c42b3231307f485e5d192007d2c/_/download/resources/jira.webresources:global-static/wiki-renderer.css?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test.atlassian.net/plugins/servlet/streamscomments/issues/BT-2?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/reply-to" /><generator uri="https://backstage-test.atlassian.net" /><atlassian:application>com.atlassian.jira</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/post</activity:verb><activity:object><id>urn:uuid:fcabd4e8-de67-3f13-ad08-9a77e2a87830</id><title type="text">BT-2</title><summary type="text">Test task 2</summary><link rel="alternate" href="https://backstage-test.atlassian.net/browse/BT-2?streamsSourceProduct=jira" /><activity:object-type>http://streams.atlassian.com/syndication/types/issue</activity:object-type></activity:object><atlassian:timezone-offset>+0100</atlassian:timezone-offset></entry><entry xmlns:activity="http://activitystrea.ms/spec/1.0/"><id>urn:uuid:9fbeac3f-fc71-3de3-ada0-91afab49b311</id><title type="html">&lt;a href="https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;amp;streamsSourceProduct=jira" class="activity-item-user activity-item-author">Marek Całus&lt;/a> created       &lt;a href="https://backstage-test.atlassian.net/browse/BT-1?streamsSourceProduct=jira">BT-1 - Test task&lt;/a>
</title><content type="html">&lt;div class="user-content">    &lt;/div> </content><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name>Marek Całus</name><email>marek.calus@withintent.com</email><uri>https://backstage-test.atlassian.net/secure/ViewProfile.jspa?accountId=5f42b4ae347294003e51f83e&amp;streamsSourceProduct=jira</uri><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5f42b4ae347294003e51f83e/1d5fed69-e36e-401b-9dd1-9687693c8d91/48?s=48" media:height="48" media:width="48" /><usr:username>ug:08129a54-b087-4f13-8cc2-ef00a3a38f4d</usr:username><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2020-12-08T19:36:32.101Z</published><updated>2020-12-08T19:36:32.101Z</updated><category term="created" /><link href="https://backstage-test.atlassian.net/browse/BT-1?streamsSourceProduct=jira" rel="alternate" /><link href="https://backstage-test.atlassian.net/secure/viewavatar?size=medium&amp;avatarId=10315&amp;avatarType=issuetype&amp;streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/icon" title="Story" /><link href="https://backstage-test.atlassian.net/s/o2joag/b/24/8dc2987eee643c42b3231307f485e5d192007d2c/_/download/resources/jira.webresources:global-static/wiki-renderer.css?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test.atlassian.net/plugins/servlet/streamscomments/issues/BT-1?streamsSourceProduct=jira" rel="http://streams.atlassian.com/syndication/reply-to" /><generator uri="https://backstage-test.atlassian.net" /><atlassian:application>com.atlassian.jira</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/post</activity:verb><activity:object><id>urn:uuid:9fbeac3f-fc71-3de3-ada0-91afab49b311</id><title type="text">BT-1</title><summary type="text">Test task</summary><link rel="alternate" href="https://backstage-test.atlassian.net/browse/BT-1?streamsSourceProduct=jira" /><activity:object-type>http://streams.atlassian.com/syndication/types/issue</activity:object-type></activity:object><atlassian:timezone-offset>+0100</atlassian:timezone-offset></entry>
<entry xmlns:activity="http://activitystrea.ms/spec/1.0/"><id></id><title type="html">    &lt;a href='https://github.com/mcalus3' target='_blank'>Marek Całus&lt;/a>committed changeset &lt;a href="https://github.com/RoadieHQ/backstage-plugin-jira/commit/69a7a1cc345beee8856861f6e55e51aa932c4cdb">69a7a1cc345beee8856861f6e55e51aa932c4cdb&lt;/a> saying:</title><content type="html">Add basic test &lt;br> &lt;br> Changes:&lt;br> &lt;ul>&lt;li>&lt;span style="color: blue;font-size: 8.0pt;">MODIFIED&lt;/span>             &lt;a href="https://github.com/RoadieHQ/backstage-plugin-jira/commit/69a7a1cc345beee8856861f6e55e51aa932c4cdb#diff-7ae45ad102eab3b6d7e7896acd08c427a9b25b346470d7bc6507b6481575d519">package.json&lt;/a>                       &lt;li>&lt;span style="color: blue;font-size: 8.0pt;">MODIFIED&lt;/span>             &lt;a href="https://github.com/RoadieHQ/backstage-plugin-jira/commit/69a7a1cc345beee8856861f6e55e51aa932c4cdb#diff-764761d79ed791ea154187526b088322dba3bebe94f9d38ab22120554aba77c7">src/api/index.ts&lt;/a>                       &lt;li>&lt;span style="color: blue;font-size: 8.0pt;">MODIFIED&lt;/span>             &lt;a href="https://github.com/RoadieHQ/backstage-plugin-jira/commit/69a7a1cc345beee8856861f6e55e51aa932c4cdb#diff-2ddb751dac3fed1070cf745c7117f2b89e394551124676556e661559e3097c63">src/components/JiraCard/JiraCard.test.tsx&lt;/a>                       &lt;li>&lt;span style="color: blue;font-size: 8.0pt;">MODIFIED&lt;/span>             &lt;a href="https://github.com/RoadieHQ/backstage-plugin-jira/commit/69a7a1cc345beee8856861f6e55e51aa932c4cdb#diff-2e75ba03c3299cf0c771c7d56f9fc8d06652435a00c1423a61283092ffa9bbe3">src/responseStubs.ts&lt;/a>              &lt;/ul>  </content><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name/><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatars.githubusercontent.com/u/24685983?v=4&amp;s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://avatars.githubusercontent.com/u/24685983?v=4&amp;s=48" media:height="48" media:width="48" /><usr:username/><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2021-01-11T13:16:39.000Z</published><updated>2021-01-11T13:16:39.000Z</updated><generator uri="https://backstage-test.atlassian.net" /><atlassian:application>com.atlassian.jira</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/update</activity:verb><activity:object><id>69a7a1cc345beee8856861f6e55e51aa932c4cdb</id><activity:object-type>http://activitystrea.ms/schema/1.0/status</activity:object-type></activity:object><atlassian:timezone-offset>+0000</atlassian:timezone-offset></entry>
<entry xmlns:activity="http://activitystrea.ms/spec/1.0/" xmlns:thr="http://purl.org/syndication/thread/1.0"><id>https://backstage-test-confluence.atlassian.net/display/BT/Mocked</id><title type="html">&lt;a href="https://backstage-test-confluence.atlassian.net/display/~mocked" class="activity-item-user activity-item-author">Mocked User&lt;/a> edited &lt;a href="https://backstage-test-confluence.atlassian.net/display/BT/Mocked">Mocked&lt;/a></title><content type="html">&lt;div class="user-content">          &lt;blockquote>Confluence page update&lt;/blockquote>  (&lt;a href="https://backstage-test-confluence.atlassian.net/pages/diffpagesbyversion.action?pageId=12345678&amp;originalVersion=3&amp;revisedVersion=4">view change&lt;/a>)   &lt;/div> </content><author xmlns:usr="http://streams.atlassian.com/syndication/username/1.0"><name>Mocked User</name><email>mocked.user@example.com</email><uri>https://backstage-test-confluence.atlassian.net/display/~mocked</uri><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://backstage-test-confluence.atlassian.net/download/attachments/12345678/user-avatar?s=16" media:height="16" media:width="16" /><link xmlns:media="http://purl.org/syndication/atommedia" rel="photo" href="https://backstage-test-confluence.atlassian.net/download/attachments/12345678/user-avatar?s=48" media:height="48" media:width="48" /><usr:username>mocked</usr:username><activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type></author><published>2021-03-05T15:03:54.000Z</published><updated>2021-03-05T15:03:54.000Z</updated><category term="page" /><link href="https://backstage-test-confluence.atlassian.net/display/BT/Mocked" rel="alternate" /><link href="https://backstage-test-confluence.atlassian.net/plugins/servlet/streamscomments/wiki/page/12345678" rel="http://streams.atlassian.com/syndication/reply-to" /><link href="https://backstage-test-confluence.atlassian.net/images/icons/mocked_icon_filename.gif" rel="http://streams.atlassian.com/syndication/icon" title="Page" /><link href="https://backstage-test-confluence.atlassian.net/s/-8z9epv/8401/1eaa024f06dac58f149033b1fed7ed2ee21ec52c/1.0/_/download/resources/confluence.web.resources:content-styles/master.css" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test-confluence.atlassian.net/s/-8z9epv/8401/1eaa024f06dac58f149033b1fed7ed2ee21ec52c/1.0/_/download/resources/confluence.web.resources:content-styles/wiki-content.css" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test-confluence.atlassian.net/s/-8z9epv/8401/1eaa024f06dac58f149033b1fed7ed2ee21ec52c/1.0/_/download/resources/confluence.web.resources:content-styles/tables.css" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test-confluence.atlassian.net/s/-8z9epv/8401/1eaa024f06dac58f149033b1fed7ed2ee21ec52c/1.0/_/download/resources/confluence.web.resources:content-styles/renderer-macros.css" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test-confluence.atlassian.net/s/-8z9epv/8401/1eaa024f06dac58f149033b1fed7ed2ee21ec52c/1.0/_/download/resources/confluence.web.resources:panel-styles/panels.css" rel="http://streams.atlassian.com/syndication/css" /><link href="https://backstage-test-confluence.atlassian.net/s/-8z9epv/8401/1eaa024f06dac58f149033b1fed7ed2ee21ec52c/1.0/_/download/resources/confluence.web.resources:master-styles/icons.css" rel="http://streams.atlassian.com/syndication/css" /><thr:in-reply-to ref="https://backstage-test-confluence.atlassian.net/plugins/servlet/streamscomments/wiki/page/12345678" /><generator uri="https://backstage-test-confluence.atlassian.net" /><atlassian:application>com.atlassian.confluence</atlassian:application><activity:verb>http://activitystrea.ms/schema/1.0/update</activity:verb><activity:object><id>https://backstage-test-confluence.atlassian.net/display/BT/Mocked</id><title type="text">Mocked</title><link rel="alternate" href="https://backstage-test-confluence.atlassian.net/display/BT/Mocked" /><activity:object-type>http://streams.atlassian.com/syndication/types/page</activity:object-type></activity:object><activity:target><id>https://backstage-test-confluence.atlassian.net/display/BT</id><title type="text">BT</title><link rel="alternate" href="https://backstage-test-confluence.atlassian.net/display/BT" /><activity:object-type>http://streams.atlassian.com/syndication/types/space</activity:object-type></activity:target><atlassian:timezone-offset>+0000</atlassian:timezone-offset><source><id>https://backstage-test-confluence.atlassian.net/activity?use-accept-lang=true&amp;streams=key+IS+BT&amp;authOnly=true&amp;local=true&amp;maxResults=25&amp;os_authType=basic</id><link href="https://backstage-test-confluence.atlassian.net/activity?use-accept-lang=true&amp;streams=key+IS+BT&amp;authOnly=true&amp;local=true&amp;maxResults=25&amp;os_authType=basic" rel="self" /><title type="text">Activity Streams</title><atlassian:timezone-offset>+0000</atlassian:timezone-offset><updated>2021-03-05T15:03:54.000Z</updated></source></entry></feed>`;
