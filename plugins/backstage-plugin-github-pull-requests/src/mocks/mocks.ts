export const entityMock = {
  metadata: {
    namespace: 'default',
    annotations: {
      'backstage.io/managed-by-location':
        'url:https://github.com/mcalus3/sample-service/blob/master/backstage4.yaml',
      'github.com/project-slug': 'RoadieHQ/backstage-plugin-argo-cd',
    },
    name: 'sample-service',
    description:
      'A service for testing Backstage functionality. For example, we can trigger errors\non the sample-service, these are sent to Sentry, then we can view them in the \nBackstage plugin for Sentry.\n',
    uid: '33f123a4-e83e-4d3f-8baa-631266c5638b',
    etag: 'ZTVmZThhZDctN2VkYi00OTI5LTlkZDMtZTBkNDA4ODg3NDQ4',
    generation: 1,
  },
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  spec: {
    type: 'service',
    owner: 'david@roadie.io',
    lifecycle: 'experimental',
  },
  relations: [
    {
      target: { kind: 'group', namespace: 'default', name: 'david@roadie.io' },
      type: 'ownedBy',
    },
  ],
};

export const openPullsRequestMock = [
  {
    url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/8',
    id: 550981790,
    node_id: 'MDExOlB1bGxSZXF1ZXN0NTUwOTgxNzkw',
    html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/8',
    diff_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/8.diff',
    patch_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/8.patch',
    issue_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/8',
    number: 8,
    state: 'open',
    locked: false,
    title: 'add test with msw library',
    user: {
      login: 'mcalus3',
      id: 24685983,
      node_id: 'MDQ6VXNlcjI0Njg1OTgz',
      avatar_url: 'https://avatars0.githubusercontent.com/u/24685983?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/mcalus3',
      html_url: 'https://github.com/mcalus3',
      followers_url: 'https://api.github.com/users/mcalus3/followers',
      following_url:
        'https://api.github.com/users/mcalus3/following{/other_user}',
      gists_url: 'https://api.github.com/users/mcalus3/gists{/gist_id}',
      starred_url:
        'https://api.github.com/users/mcalus3/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/mcalus3/subscriptions',
      organizations_url: 'https://api.github.com/users/mcalus3/orgs',
      repos_url: 'https://api.github.com/users/mcalus3/repos',
      events_url: 'https://api.github.com/users/mcalus3/events{/privacy}',
      received_events_url:
        'https://api.github.com/users/mcalus3/received_events',
      type: 'User',
      site_admin: false,
    },
    body:
      "Added a test with msw that should identify breaking changes in the plugin\r\n\r\n> @iain-b @Xantier\r\n> during running new test, error \"TypeError: Cannot read property 'json' of undefined\" occurs, i believe that it's in the line:\r\n> \r\n> https://github.com/RoadieHQ/backstage-plugin-argo-cd/blob/e6b755767c77e16ce94151ee2a7ba49aec0b1e51/src/api/index.ts#L36\r\n> \r\n> I haven't found any obvious reasons for msw returning undefined as a response in this situation, i've configured it same as in other backstage tests (https://github.com/backstage/backstage/blob/master/packages/catalog-client/src/CatalogClient.test.ts or https://github.com/backstage/backstage/blob/master/packages/backend-common/src/reading/AzureUrlReader.test.ts).\r\n> \r\n> I just realized that these tests i'm basing on don't test react components (it shouldn't make any difference though).\r\n> \r\n> EDIT1: I've found out that the line `jest.resetAllMocks();` breaks the fetch function. (more about it: https://github.com/jefflau/jest-fetch-mock/issues/81). The response still don't have any payload though...\r\n> EDIT2: Done using cross-fetch",
    created_at: '2021-01-07T10:51:17Z',
    updated_at: '2021-01-10T12:33:34Z',
    closed_at: null,
    merged_at: null,
    merge_commit_sha: 'ed6f466421620293f3ba5c35d73c6bd136d13849',
    assignee: null,
    assignees: [],
    requested_reviewers: [
      {
        login: 'martina-if',
        id: 736631,
        node_id: 'MDQ6VXNlcjczNjYzMQ==',
        avatar_url: 'https://avatars0.githubusercontent.com/u/736631?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/martina-if',
        html_url: 'https://github.com/martina-if',
        followers_url: 'https://api.github.com/users/martina-if/followers',
        following_url:
          'https://api.github.com/users/martina-if/following{/other_user}',
        gists_url: 'https://api.github.com/users/martina-if/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/martina-if/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/martina-if/subscriptions',
        organizations_url: 'https://api.github.com/users/martina-if/orgs',
        repos_url: 'https://api.github.com/users/martina-if/repos',
        events_url: 'https://api.github.com/users/martina-if/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/martina-if/received_events',
        type: 'User',
        site_admin: false,
      },
      {
        login: 'iain-b',
        id: 1415599,
        node_id: 'MDQ6VXNlcjE0MTU1OTk=',
        avatar_url: 'https://avatars0.githubusercontent.com/u/1415599?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/iain-b',
        html_url: 'https://github.com/iain-b',
        followers_url: 'https://api.github.com/users/iain-b/followers',
        following_url:
          'https://api.github.com/users/iain-b/following{/other_user}',
        gists_url: 'https://api.github.com/users/iain-b/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/iain-b/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/iain-b/subscriptions',
        organizations_url: 'https://api.github.com/users/iain-b/orgs',
        repos_url: 'https://api.github.com/users/iain-b/repos',
        events_url: 'https://api.github.com/users/iain-b/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/iain-b/received_events',
        type: 'User',
        site_admin: false,
      },
      {
        login: 'padraigobrien',
        id: 1910868,
        node_id: 'MDQ6VXNlcjE5MTA4Njg=',
        avatar_url: 'https://avatars1.githubusercontent.com/u/1910868?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/padraigobrien',
        html_url: 'https://github.com/padraigobrien',
        followers_url: 'https://api.github.com/users/padraigobrien/followers',
        following_url:
          'https://api.github.com/users/padraigobrien/following{/other_user}',
        gists_url: 'https://api.github.com/users/padraigobrien/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/padraigobrien/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/padraigobrien/subscriptions',
        organizations_url: 'https://api.github.com/users/padraigobrien/orgs',
        repos_url: 'https://api.github.com/users/padraigobrien/repos',
        events_url:
          'https://api.github.com/users/padraigobrien/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/padraigobrien/received_events',
        type: 'User',
        site_admin: false,
      },
      {
        login: 'Xantier',
        id: 2392775,
        node_id: 'MDQ6VXNlcjIzOTI3NzU=',
        avatar_url: 'https://avatars1.githubusercontent.com/u/2392775?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/Xantier',
        html_url: 'https://github.com/Xantier',
        followers_url: 'https://api.github.com/users/Xantier/followers',
        following_url:
          'https://api.github.com/users/Xantier/following{/other_user}',
        gists_url: 'https://api.github.com/users/Xantier/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/Xantier/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/Xantier/subscriptions',
        organizations_url: 'https://api.github.com/users/Xantier/orgs',
        repos_url: 'https://api.github.com/users/Xantier/repos',
        events_url: 'https://api.github.com/users/Xantier/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/Xantier/received_events',
        type: 'User',
        site_admin: false,
      },
    ],
    requested_teams: [],
    labels: [],
    milestone: null,
    draft: false,
    commits_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/8/commits',
    review_comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/8/comments',
    review_comment_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
    comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/8/comments',
    statuses_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/a1135d64af8c277f08fe3b978fb7933303ddec98',
    head: {
      label: 'RoadieHQ:add-tests',
      ref: 'add-tests',
      sha: 'a1135d64af8c277f08fe3b978fb7933303ddec98',
      user: {
        login: 'RoadieHQ',
        id: 61759275,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
        avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/RoadieHQ',
        html_url: 'https://github.com/RoadieHQ',
        followers_url: 'https://api.github.com/users/RoadieHQ/followers',
        following_url:
          'https://api.github.com/users/RoadieHQ/following{/other_user}',
        gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/RoadieHQ/subscriptions',
        organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
        repos_url: 'https://api.github.com/users/RoadieHQ/repos',
        events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/RoadieHQ/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 316212680,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTYyMTI2ODA=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'RoadieHQ/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'RoadieHQ',
          id: 61759275,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
          avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/RoadieHQ',
          html_url: 'https://github.com/RoadieHQ',
          followers_url: 'https://api.github.com/users/RoadieHQ/followers',
          following_url:
            'https://api.github.com/users/RoadieHQ/following{/other_user}',
          gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/RoadieHQ/subscriptions',
          organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
          repos_url: 'https://api.github.com/users/RoadieHQ/repos',
          events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/RoadieHQ/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: false,
        url: 'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/deployments',
        created_at: '2020-11-26T11:39:11Z',
        updated_at: '2020-12-31T21:24:07Z',
        pushed_at: '2021-01-07T18:14:05Z',
        git_url: 'git://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:RoadieHQ/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        homepage: null,
        size: 814,
        stargazers_count: 3,
        watchers_count: 3,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 1,
        open_issues: 5,
        watchers: 3,
        default_branch: 'main',
      },
    },
    base: {
      label: 'RoadieHQ:main',
      ref: 'main',
      sha: 'e6b755767c77e16ce94151ee2a7ba49aec0b1e51',
      user: {
        login: 'RoadieHQ',
        id: 61759275,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
        avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/RoadieHQ',
        html_url: 'https://github.com/RoadieHQ',
        followers_url: 'https://api.github.com/users/RoadieHQ/followers',
        following_url:
          'https://api.github.com/users/RoadieHQ/following{/other_user}',
        gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/RoadieHQ/subscriptions',
        organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
        repos_url: 'https://api.github.com/users/RoadieHQ/repos',
        events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/RoadieHQ/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 316212680,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTYyMTI2ODA=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'RoadieHQ/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'RoadieHQ',
          id: 61759275,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
          avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/RoadieHQ',
          html_url: 'https://github.com/RoadieHQ',
          followers_url: 'https://api.github.com/users/RoadieHQ/followers',
          following_url:
            'https://api.github.com/users/RoadieHQ/following{/other_user}',
          gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/RoadieHQ/subscriptions',
          organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
          repos_url: 'https://api.github.com/users/RoadieHQ/repos',
          events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/RoadieHQ/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: false,
        url: 'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/deployments',
        created_at: '2020-11-26T11:39:11Z',
        updated_at: '2020-12-31T21:24:07Z',
        pushed_at: '2021-01-07T18:14:05Z',
        git_url: 'git://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:RoadieHQ/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        homepage: null,
        size: 814,
        stargazers_count: 3,
        watchers_count: 3,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 1,
        open_issues: 5,
        watchers: 3,
        default_branch: 'main',
      },
    },
    _links: {
      self: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/8',
      },
      html: {
        href: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/8',
      },
      issue: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/8',
      },
      comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/8/comments',
      },
      review_comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/8/comments',
      },
      review_comment: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
      },
      commits: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/8/commits',
      },
      statuses: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/a1135d64af8c277f08fe3b978fb7933303ddec98',
      },
    },
    author_association: 'COLLABORATOR',
    active_lock_reason: null,
  },
  {
    url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/7',
    id: 546157240,
    node_id: 'MDExOlB1bGxSZXF1ZXN0NTQ2MTU3MjQw',
    html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/7',
    diff_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/7.diff',
    patch_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/7.patch',
    issue_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/7',
    number: 7,
    state: 'open',
    locked: false,
    title: 'Allow displaying multiple apps queried by name or selector',
    user: {
      login: 'muenchdo',
      id: 2647997,
      node_id: 'MDQ6VXNlcjI2NDc5OTc=',
      avatar_url: 'https://avatars3.githubusercontent.com/u/2647997?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/muenchdo',
      html_url: 'https://github.com/muenchdo',
      followers_url: 'https://api.github.com/users/muenchdo/followers',
      following_url:
        'https://api.github.com/users/muenchdo/following{/other_user}',
      gists_url: 'https://api.github.com/users/muenchdo/gists{/gist_id}',
      starred_url:
        'https://api.github.com/users/muenchdo/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/muenchdo/subscriptions',
      organizations_url: 'https://api.github.com/users/muenchdo/orgs',
      repos_url: 'https://api.github.com/users/muenchdo/repos',
      events_url: 'https://api.github.com/users/muenchdo/events{/privacy}',
      received_events_url:
        'https://api.github.com/users/muenchdo/received_events',
      type: 'User',
      site_admin: false,
    },
    body:
      'I would like to propose this change to the way Argo CD applications are queried and displayed for an entity. Instead of assuming a 1:1 mapping between an entity and Argo CD application, this allows defining a label selector that can be used to retrieve a list of matching applications.\r\n\r\nIt ends up looking like this:\r\n<img width="902" alt="Screen Shot 2020-12-28 at 16 35 21" src="https://user-images.githubusercontent.com/2647997/103229004-7086b180-4932-11eb-920b-4c2f19f9dd6b.png">\r\n\r\nMaking it a draft PR for now, as the styling definitely needs some love and I\'m not too happy with that weird [type switching](https://github.com/RoadieHQ/backstage-plugin-argo-cd/compare/main...muenchdo:main#diff-dc9603413065e1b754b41f1316a7eed61f0009b2107ddf34379548a5800229b9R137-R148).',
    created_at: '2020-12-28T16:34:48Z',
    updated_at: '2021-01-09T14:39:40Z',
    closed_at: null,
    merged_at: null,
    merge_commit_sha: '6d827d8d63fb0053c5e9cac377df29a2d1bf1098',
    assignee: null,
    assignees: [],
    requested_reviewers: [],
    requested_teams: [],
    labels: [
      {
        id: 2535947144,
        node_id: 'MDU6TGFiZWwyNTM1OTQ3MTQ0',
        url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels/enhancement',
        name: 'enhancement',
        color: 'a2eeef',
        default: true,
        description: 'New feature or request',
      },
    ],
    milestone: null,
    draft: false,
    commits_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/7/commits',
    review_comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/7/comments',
    review_comment_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
    comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/7/comments',
    statuses_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/696c1bf7b65cdb4423e354519cac7a889c581bc7',
    head: {
      label: 'muenchdo:main',
      ref: 'main',
      sha: '696c1bf7b65cdb4423e354519cac7a889c581bc7',
      user: {
        login: 'muenchdo',
        id: 2647997,
        node_id: 'MDQ6VXNlcjI2NDc5OTc=',
        avatar_url: 'https://avatars3.githubusercontent.com/u/2647997?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/muenchdo',
        html_url: 'https://github.com/muenchdo',
        followers_url: 'https://api.github.com/users/muenchdo/followers',
        following_url:
          'https://api.github.com/users/muenchdo/following{/other_user}',
        gists_url: 'https://api.github.com/users/muenchdo/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/muenchdo/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/muenchdo/subscriptions',
        organizations_url: 'https://api.github.com/users/muenchdo/orgs',
        repos_url: 'https://api.github.com/users/muenchdo/repos',
        events_url: 'https://api.github.com/users/muenchdo/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/muenchdo/received_events',
        type: 'User',
        site_admin: false,
      },
      repo: {
        id: 324857285,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMjQ4NTcyODU=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'muenchdo/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'muenchdo',
          id: 2647997,
          node_id: 'MDQ6VXNlcjI2NDc5OTc=',
          avatar_url: 'https://avatars3.githubusercontent.com/u/2647997?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/muenchdo',
          html_url: 'https://github.com/muenchdo',
          followers_url: 'https://api.github.com/users/muenchdo/followers',
          following_url:
            'https://api.github.com/users/muenchdo/following{/other_user}',
          gists_url: 'https://api.github.com/users/muenchdo/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/muenchdo/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/muenchdo/subscriptions',
          organizations_url: 'https://api.github.com/users/muenchdo/orgs',
          repos_url: 'https://api.github.com/users/muenchdo/repos',
          events_url: 'https://api.github.com/users/muenchdo/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/muenchdo/received_events',
          type: 'User',
          site_admin: false,
        },
        html_url: 'https://github.com/muenchdo/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: true,
        url: 'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/muenchdo/backstage-plugin-argo-cd/deployments',
        created_at: '2020-12-27T22:05:50Z',
        updated_at: '2020-12-28T16:41:51Z',
        pushed_at: '2020-12-28T16:41:48Z',
        git_url: 'git://github.com/muenchdo/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:muenchdo/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/muenchdo/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/muenchdo/backstage-plugin-argo-cd',
        homepage: null,
        size: 571,
        stargazers_count: 0,
        watchers_count: 0,
        language: 'TypeScript',
        has_issues: false,
        has_projects: true,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 0,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 0,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 0,
        open_issues: 0,
        watchers: 0,
        default_branch: 'main',
      },
    },
    base: {
      label: 'RoadieHQ:main',
      ref: 'main',
      sha: 'e6b755767c77e16ce94151ee2a7ba49aec0b1e51',
      user: {
        login: 'RoadieHQ',
        id: 61759275,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
        avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/RoadieHQ',
        html_url: 'https://github.com/RoadieHQ',
        followers_url: 'https://api.github.com/users/RoadieHQ/followers',
        following_url:
          'https://api.github.com/users/RoadieHQ/following{/other_user}',
        gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/RoadieHQ/subscriptions',
        organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
        repos_url: 'https://api.github.com/users/RoadieHQ/repos',
        events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/RoadieHQ/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 316212680,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTYyMTI2ODA=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'RoadieHQ/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'RoadieHQ',
          id: 61759275,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
          avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/RoadieHQ',
          html_url: 'https://github.com/RoadieHQ',
          followers_url: 'https://api.github.com/users/RoadieHQ/followers',
          following_url:
            'https://api.github.com/users/RoadieHQ/following{/other_user}',
          gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/RoadieHQ/subscriptions',
          organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
          repos_url: 'https://api.github.com/users/RoadieHQ/repos',
          events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/RoadieHQ/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: false,
        url: 'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/deployments',
        created_at: '2020-11-26T11:39:11Z',
        updated_at: '2020-12-31T21:24:07Z',
        pushed_at: '2021-01-07T18:14:05Z',
        git_url: 'git://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:RoadieHQ/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        homepage: null,
        size: 814,
        stargazers_count: 3,
        watchers_count: 3,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 1,
        open_issues: 5,
        watchers: 3,
        default_branch: 'main',
      },
    },
    _links: {
      self: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/7',
      },
      html: {
        href: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/7',
      },
      issue: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/7',
      },
      comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/7/comments',
      },
      review_comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/7/comments',
      },
      review_comment: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
      },
      commits: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/7/commits',
      },
      statuses: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/696c1bf7b65cdb4423e354519cac7a889c581bc7',
      },
    },
    author_association: 'FIRST_TIME_CONTRIBUTOR',
    active_lock_reason: null,
  },
  {
    url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/3',
    id: 538890789,
    node_id: 'MDExOlB1bGxSZXF1ZXN0NTM4ODkwNzg5',
    html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/3',
    diff_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/3.diff',
    patch_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/3.patch',
    issue_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/3',
    number: 3,
    state: 'open',
    locked: false,
    title: 'Bump ini from 1.3.5 to 1.3.8',
    user: {
      login: 'dependabot[bot]',
      id: 49699333,
      node_id: 'MDM6Qm90NDk2OTkzMzM=',
      avatar_url: 'https://avatars0.githubusercontent.com/in/29110?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/dependabot%5Bbot%5D',
      html_url: 'https://github.com/apps/dependabot',
      followers_url:
        'https://api.github.com/users/dependabot%5Bbot%5D/followers',
      following_url:
        'https://api.github.com/users/dependabot%5Bbot%5D/following{/other_user}',
      gists_url:
        'https://api.github.com/users/dependabot%5Bbot%5D/gists{/gist_id}',
      starred_url:
        'https://api.github.com/users/dependabot%5Bbot%5D/starred{/owner}{/repo}',
      subscriptions_url:
        'https://api.github.com/users/dependabot%5Bbot%5D/subscriptions',
      organizations_url:
        'https://api.github.com/users/dependabot%5Bbot%5D/orgs',
      repos_url: 'https://api.github.com/users/dependabot%5Bbot%5D/repos',
      events_url:
        'https://api.github.com/users/dependabot%5Bbot%5D/events{/privacy}',
      received_events_url:
        'https://api.github.com/users/dependabot%5Bbot%5D/received_events',
      type: 'Bot',
      site_admin: false,
    },
    body:
      'Bumps [ini](https://github.com/isaacs/ini) from 1.3.5 to 1.3.8.\n<details>\n<summary>Commits</summary>\n<ul>\n<li><a href="https://github.com/npm/ini/commit/a2c5da86604bc2238fe393c5ff083bf23a9910eb"><code>a2c5da8</code></a> 1.3.8</li>\n<li><a href="https://github.com/npm/ini/commit/af5c6bb5dca6f0248c153aa87e25bddfc515ff6e"><code>af5c6bb</code></a> Do not use Object.create(null)</li>\n<li><a href="https://github.com/npm/ini/commit/8b648a1ac49e1b3b7686ea957e0b95e544bc6ec1"><code>8b648a1</code></a> don\'t test where our devdeps don\'t even work</li>\n<li><a href="https://github.com/npm/ini/commit/c74c8af35f32b801a7e82a8309eab792a95932f6"><code>c74c8af</code></a> 1.3.7</li>\n<li><a href="https://github.com/npm/ini/commit/024b8b55ac1c980c6225607b007714c54eb501ba"><code>024b8b5</code></a> update deps, add linting</li>\n<li><a href="https://github.com/npm/ini/commit/032fbaf5f0b98fce70c8cc380e0d05177a9c9073"><code>032fbaf</code></a> Use Object.create(null) to avoid default object property hazards</li>\n<li><a href="https://github.com/npm/ini/commit/2da90391ef70db41d10f013e3a87f9a8c5d01a72"><code>2da9039</code></a> 1.3.6</li>\n<li><a href="https://github.com/npm/ini/commit/cfea636f534b5ca7550d2c28b7d1a95d936d56c6"><code>cfea636</code></a> better git push script, before publish instead of after</li>\n<li><a href="https://github.com/npm/ini/commit/56d2805e07ccd94e2ba0984ac9240ff02d44b6f1"><code>56d2805</code></a> do not allow invalid hazardous string as section name</li>\n<li>See full diff in <a href="https://github.com/isaacs/ini/compare/v1.3.5...v1.3.8">compare view</a></li>\n</ul>\n</details>\n<details>\n<summary>Maintainer changes</summary>\n<p>This version was pushed to npm by <a href="https://www.npmjs.com/~isaacs">isaacs</a>, a new releaser for ini since your current version.</p>\n</details>\n<br />\n\n\n[![Dependabot compatibility score](https://dependabot-badges.githubapp.com/badges/compatibility_score?dependency-name=ini&package-manager=npm_and_yarn&previous-version=1.3.5&new-version=1.3.8)](https://docs.github.com/en/github/managing-security-vulnerabilities/about-dependabot-security-updates#about-compatibility-scores)\n\nDependabot will resolve any conflicts with this PR as long as you don\'t alter it yourself. You can also trigger a rebase manually by commenting `@dependabot rebase`.\n\n[//]: # (dependabot-automerge-start)\n[//]: # (dependabot-automerge-end)\n\n---\n\n<details>\n<summary>Dependabot commands and options</summary>\n<br />\n\nYou can trigger Dependabot actions by commenting on this PR:\n- `@dependabot rebase` will rebase this PR\n- `@dependabot recreate` will recreate this PR, overwriting any edits that have been made to it\n- `@dependabot merge` will merge this PR after your CI passes on it\n- `@dependabot squash and merge` will squash and merge this PR after your CI passes on it\n- `@dependabot cancel merge` will cancel a previously requested merge and block automerging\n- `@dependabot reopen` will reopen this PR if it is closed\n- `@dependabot close` will close this PR and stop Dependabot recreating it. You can achieve the same result by closing it manually\n- `@dependabot ignore this major version` will close this PR and stop Dependabot creating any more for this major version (unless you reopen the PR or upgrade to it yourself)\n- `@dependabot ignore this minor version` will close this PR and stop Dependabot creating any more for this minor version (unless you reopen the PR or upgrade to it yourself)\n- `@dependabot ignore this dependency` will close this PR and stop Dependabot creating any more for this dependency (unless you reopen the PR or upgrade to it yourself)\n- `@dependabot use these labels` will set the current labels as the default for future PRs for this repo and language\n- `@dependabot use these reviewers` will set the current reviewers as the default for future PRs for this repo and language\n- `@dependabot use these assignees` will set the current assignees as the default for future PRs for this repo and language\n- `@dependabot use this milestone` will set the current milestone as the default for future PRs for this repo and language\n\nYou can disable automated security fix PRs for this repo from the [Security Alerts page](https://github.com/RoadieHQ/backstage-plugin-argo-cd/network/alerts).\n\n</details>',
    created_at: '2020-12-13T07:36:10Z',
    updated_at: '2020-12-18T07:41:59Z',
    closed_at: null,
    merged_at: null,
    merge_commit_sha: '4ce91c0fe699da181b995132f192143be3705175',
    assignee: null,
    assignees: [],
    requested_reviewers: [],
    requested_teams: [],
    labels: [
      {
        id: 2579513429,
        node_id: 'MDU6TGFiZWwyNTc5NTEzNDI5',
        url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels/dependencies',
        name: 'dependencies',
        color: '0366d6',
        default: false,
        description: 'Pull requests that update a dependency file',
      },
    ],
    milestone: null,
    draft: false,
    commits_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/3/commits',
    review_comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/3/comments',
    review_comment_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
    comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/3/comments',
    statuses_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/35837658d2aae9c20c01b5b62046c31e49239939',
    head: {
      label: 'RoadieHQ:dependabot/npm_and_yarn/ini-1.3.8',
      ref: 'dependabot/npm_and_yarn/ini-1.3.8',
      sha: '35837658d2aae9c20c01b5b62046c31e49239939',
      user: {
        login: 'RoadieHQ',
        id: 61759275,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
        avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/RoadieHQ',
        html_url: 'https://github.com/RoadieHQ',
        followers_url: 'https://api.github.com/users/RoadieHQ/followers',
        following_url:
          'https://api.github.com/users/RoadieHQ/following{/other_user}',
        gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/RoadieHQ/subscriptions',
        organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
        repos_url: 'https://api.github.com/users/RoadieHQ/repos',
        events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/RoadieHQ/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 316212680,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTYyMTI2ODA=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'RoadieHQ/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'RoadieHQ',
          id: 61759275,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
          avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/RoadieHQ',
          html_url: 'https://github.com/RoadieHQ',
          followers_url: 'https://api.github.com/users/RoadieHQ/followers',
          following_url:
            'https://api.github.com/users/RoadieHQ/following{/other_user}',
          gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/RoadieHQ/subscriptions',
          organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
          repos_url: 'https://api.github.com/users/RoadieHQ/repos',
          events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/RoadieHQ/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: false,
        url: 'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/deployments',
        created_at: '2020-11-26T11:39:11Z',
        updated_at: '2020-12-31T21:24:07Z',
        pushed_at: '2021-01-07T18:14:05Z',
        git_url: 'git://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:RoadieHQ/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        homepage: null,
        size: 814,
        stargazers_count: 3,
        watchers_count: 3,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 1,
        open_issues: 5,
        watchers: 3,
        default_branch: 'main',
      },
    },
    base: {
      label: 'RoadieHQ:main',
      ref: 'main',
      sha: '9236eada698654324888a3736ae264552d2091a2',
      user: {
        login: 'RoadieHQ',
        id: 61759275,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
        avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/RoadieHQ',
        html_url: 'https://github.com/RoadieHQ',
        followers_url: 'https://api.github.com/users/RoadieHQ/followers',
        following_url:
          'https://api.github.com/users/RoadieHQ/following{/other_user}',
        gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/RoadieHQ/subscriptions',
        organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
        repos_url: 'https://api.github.com/users/RoadieHQ/repos',
        events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/RoadieHQ/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 316212680,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTYyMTI2ODA=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'RoadieHQ/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'RoadieHQ',
          id: 61759275,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
          avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/RoadieHQ',
          html_url: 'https://github.com/RoadieHQ',
          followers_url: 'https://api.github.com/users/RoadieHQ/followers',
          following_url:
            'https://api.github.com/users/RoadieHQ/following{/other_user}',
          gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/RoadieHQ/subscriptions',
          organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
          repos_url: 'https://api.github.com/users/RoadieHQ/repos',
          events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/RoadieHQ/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: false,
        url: 'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/deployments',
        created_at: '2020-11-26T11:39:11Z',
        updated_at: '2020-12-31T21:24:07Z',
        pushed_at: '2021-01-07T18:14:05Z',
        git_url: 'git://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:RoadieHQ/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        homepage: null,
        size: 814,
        stargazers_count: 3,
        watchers_count: 3,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 1,
        open_issues: 5,
        watchers: 3,
        default_branch: 'main',
      },
    },
    _links: {
      self: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/3',
      },
      html: {
        href: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/3',
      },
      issue: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/3',
      },
      comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/3/comments',
      },
      review_comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/3/comments',
      },
      review_comment: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
      },
      commits: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/3/commits',
      },
      statuses: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/35837658d2aae9c20c01b5b62046c31e49239939',
      },
    },
    author_association: 'NONE',
    active_lock_reason: null,
  },
];

export const closedPullsRequestMock = [
  {
    url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/6',
    id: 543630467,
    node_id: 'MDExOlB1bGxSZXF1ZXN0NTQzNjMwNDY3',
    html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/6',
    diff_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/6.diff',
    patch_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/6.patch',
    issue_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/6',
    number: 6,
    state: 'closed',
    locked: false,
    title: 'Update codeQL workflow file',
    user: {
      login: 'mcalus3',
      id: 24685983,
      node_id: 'MDQ6VXNlcjI0Njg1OTgz',
      avatar_url: 'https://avatars0.githubusercontent.com/u/24685983?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/mcalus3',
      html_url: 'https://github.com/mcalus3',
      followers_url: 'https://api.github.com/users/mcalus3/followers',
      following_url:
        'https://api.github.com/users/mcalus3/following{/other_user}',
      gists_url: 'https://api.github.com/users/mcalus3/gists{/gist_id}',
      starred_url:
        'https://api.github.com/users/mcalus3/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/mcalus3/subscriptions',
      organizations_url: 'https://api.github.com/users/mcalus3/orgs',
      repos_url: 'https://api.github.com/users/mcalus3/repos',
      events_url: 'https://api.github.com/users/mcalus3/events{/privacy}',
      received_events_url:
        'https://api.github.com/users/mcalus3/received_events',
      type: 'User',
      site_admin: false,
    },
    body: '',
    created_at: '2020-12-21T17:38:04Z',
    updated_at: '2020-12-22T12:33:58Z',
    closed_at: '2020-12-22T12:33:58Z',
    merged_at: '2020-12-22T12:33:58Z',
    merge_commit_sha: 'e6b755767c77e16ce94151ee2a7ba49aec0b1e51',
    assignee: null,
    assignees: [],
    requested_reviewers: [],
    requested_teams: [],
    labels: [],
    milestone: null,
    draft: false,
    commits_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/6/commits',
    review_comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/6/comments',
    review_comment_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
    comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/6/comments',
    statuses_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/27fb45b50d0323e11e0578888afe7c6d29eebbd1',
    head: {
      label: 'RoadieHQ:test-release',
      ref: 'test-release',
      sha: '27fb45b50d0323e11e0578888afe7c6d29eebbd1',
      user: {
        login: 'RoadieHQ',
        id: 61759275,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
        avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/RoadieHQ',
        html_url: 'https://github.com/RoadieHQ',
        followers_url: 'https://api.github.com/users/RoadieHQ/followers',
        following_url:
          'https://api.github.com/users/RoadieHQ/following{/other_user}',
        gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/RoadieHQ/subscriptions',
        organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
        repos_url: 'https://api.github.com/users/RoadieHQ/repos',
        events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/RoadieHQ/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 316212680,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTYyMTI2ODA=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'RoadieHQ/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'RoadieHQ',
          id: 61759275,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
          avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/RoadieHQ',
          html_url: 'https://github.com/RoadieHQ',
          followers_url: 'https://api.github.com/users/RoadieHQ/followers',
          following_url:
            'https://api.github.com/users/RoadieHQ/following{/other_user}',
          gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/RoadieHQ/subscriptions',
          organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
          repos_url: 'https://api.github.com/users/RoadieHQ/repos',
          events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/RoadieHQ/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: false,
        url: 'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/deployments',
        created_at: '2020-11-26T11:39:11Z',
        updated_at: '2020-12-31T21:24:07Z',
        pushed_at: '2021-01-07T18:14:05Z',
        git_url: 'git://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:RoadieHQ/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        homepage: null,
        size: 814,
        stargazers_count: 3,
        watchers_count: 3,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 1,
        open_issues: 5,
        watchers: 3,
        default_branch: 'main',
      },
    },
    base: {
      label: 'RoadieHQ:main',
      ref: 'main',
      sha: 'cae6b8e281544c85bce1046100e086b798164e75',
      user: {
        login: 'RoadieHQ',
        id: 61759275,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
        avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/RoadieHQ',
        html_url: 'https://github.com/RoadieHQ',
        followers_url: 'https://api.github.com/users/RoadieHQ/followers',
        following_url:
          'https://api.github.com/users/RoadieHQ/following{/other_user}',
        gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/RoadieHQ/subscriptions',
        organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
        repos_url: 'https://api.github.com/users/RoadieHQ/repos',
        events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/RoadieHQ/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 316212680,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTYyMTI2ODA=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'RoadieHQ/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'RoadieHQ',
          id: 61759275,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
          avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/RoadieHQ',
          html_url: 'https://github.com/RoadieHQ',
          followers_url: 'https://api.github.com/users/RoadieHQ/followers',
          following_url:
            'https://api.github.com/users/RoadieHQ/following{/other_user}',
          gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/RoadieHQ/subscriptions',
          organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
          repos_url: 'https://api.github.com/users/RoadieHQ/repos',
          events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/RoadieHQ/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: false,
        url: 'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/deployments',
        created_at: '2020-11-26T11:39:11Z',
        updated_at: '2020-12-31T21:24:07Z',
        pushed_at: '2021-01-07T18:14:05Z',
        git_url: 'git://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:RoadieHQ/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        homepage: null,
        size: 814,
        stargazers_count: 3,
        watchers_count: 3,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 1,
        open_issues: 5,
        watchers: 3,
        default_branch: 'main',
      },
    },
    _links: {
      self: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/6',
      },
      html: {
        href: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/6',
      },
      issue: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/6',
      },
      comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/6/comments',
      },
      review_comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/6/comments',
      },
      review_comment: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
      },
      commits: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/6/commits',
      },
      statuses: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/27fb45b50d0323e11e0578888afe7c6d29eebbd1',
      },
    },
    author_association: 'COLLABORATOR',
    active_lock_reason: null,
  },
  {
    url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/5',
    id: 543290246,
    node_id: 'MDExOlB1bGxSZXF1ZXN0NTQzMjkwMjQ2',
    html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/5',
    diff_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/5.diff',
    patch_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/5.patch',
    issue_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/5',
    number: 5,
    state: 'closed',
    locked: false,
    title: 'Test release',
    user: {
      login: 'mcalus3',
      id: 24685983,
      node_id: 'MDQ6VXNlcjI0Njg1OTgz',
      avatar_url: 'https://avatars0.githubusercontent.com/u/24685983?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/mcalus3',
      html_url: 'https://github.com/mcalus3',
      followers_url: 'https://api.github.com/users/mcalus3/followers',
      following_url:
        'https://api.github.com/users/mcalus3/following{/other_user}',
      gists_url: 'https://api.github.com/users/mcalus3/gists{/gist_id}',
      starred_url:
        'https://api.github.com/users/mcalus3/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/mcalus3/subscriptions',
      organizations_url: 'https://api.github.com/users/mcalus3/orgs',
      repos_url: 'https://api.github.com/users/mcalus3/repos',
      events_url: 'https://api.github.com/users/mcalus3/events{/privacy}',
      received_events_url:
        'https://api.github.com/users/mcalus3/received_events',
      type: 'User',
      site_admin: false,
    },
    body: '',
    created_at: '2020-12-21T07:26:59Z',
    updated_at: '2020-12-21T07:27:07Z',
    closed_at: '2020-12-21T07:27:07Z',
    merged_at: '2020-12-21T07:27:07Z',
    merge_commit_sha: 'cae6b8e281544c85bce1046100e086b798164e75',
    assignee: null,
    assignees: [],
    requested_reviewers: [],
    requested_teams: [],
    labels: [],
    milestone: null,
    draft: false,
    commits_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/5/commits',
    review_comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/5/comments',
    review_comment_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
    comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/5/comments',
    statuses_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/8e7b9d8d102019dc66394792fdb56cba9013b87b',
    head: {
      label: 'RoadieHQ:test-release',
      ref: 'test-release',
      sha: '8e7b9d8d102019dc66394792fdb56cba9013b87b',
      user: {
        login: 'RoadieHQ',
        id: 61759275,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
        avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/RoadieHQ',
        html_url: 'https://github.com/RoadieHQ',
        followers_url: 'https://api.github.com/users/RoadieHQ/followers',
        following_url:
          'https://api.github.com/users/RoadieHQ/following{/other_user}',
        gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/RoadieHQ/subscriptions',
        organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
        repos_url: 'https://api.github.com/users/RoadieHQ/repos',
        events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/RoadieHQ/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 316212680,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTYyMTI2ODA=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'RoadieHQ/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'RoadieHQ',
          id: 61759275,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
          avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/RoadieHQ',
          html_url: 'https://github.com/RoadieHQ',
          followers_url: 'https://api.github.com/users/RoadieHQ/followers',
          following_url:
            'https://api.github.com/users/RoadieHQ/following{/other_user}',
          gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/RoadieHQ/subscriptions',
          organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
          repos_url: 'https://api.github.com/users/RoadieHQ/repos',
          events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/RoadieHQ/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: false,
        url: 'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/deployments',
        created_at: '2020-11-26T11:39:11Z',
        updated_at: '2020-12-31T21:24:07Z',
        pushed_at: '2021-01-07T18:14:05Z',
        git_url: 'git://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:RoadieHQ/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        homepage: null,
        size: 814,
        stargazers_count: 3,
        watchers_count: 3,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 1,
        open_issues: 5,
        watchers: 3,
        default_branch: 'main',
      },
    },
    base: {
      label: 'RoadieHQ:main',
      ref: 'main',
      sha: '9236eada698654324888a3736ae264552d2091a2',
      user: {
        login: 'RoadieHQ',
        id: 61759275,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
        avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/RoadieHQ',
        html_url: 'https://github.com/RoadieHQ',
        followers_url: 'https://api.github.com/users/RoadieHQ/followers',
        following_url:
          'https://api.github.com/users/RoadieHQ/following{/other_user}',
        gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/RoadieHQ/subscriptions',
        organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
        repos_url: 'https://api.github.com/users/RoadieHQ/repos',
        events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/RoadieHQ/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 316212680,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTYyMTI2ODA=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'RoadieHQ/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'RoadieHQ',
          id: 61759275,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
          avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/RoadieHQ',
          html_url: 'https://github.com/RoadieHQ',
          followers_url: 'https://api.github.com/users/RoadieHQ/followers',
          following_url:
            'https://api.github.com/users/RoadieHQ/following{/other_user}',
          gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/RoadieHQ/subscriptions',
          organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
          repos_url: 'https://api.github.com/users/RoadieHQ/repos',
          events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/RoadieHQ/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: false,
        url: 'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/deployments',
        created_at: '2020-11-26T11:39:11Z',
        updated_at: '2020-12-31T21:24:07Z',
        pushed_at: '2021-01-07T18:14:05Z',
        git_url: 'git://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:RoadieHQ/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        homepage: null,
        size: 814,
        stargazers_count: 3,
        watchers_count: 3,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 1,
        open_issues: 5,
        watchers: 3,
        default_branch: 'main',
      },
    },
    _links: {
      self: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/5',
      },
      html: {
        href: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/5',
      },
      issue: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/5',
      },
      comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/5/comments',
      },
      review_comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/5/comments',
      },
      review_comment: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
      },
      commits: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/5/commits',
      },
      statuses: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/8e7b9d8d102019dc66394792fdb56cba9013b87b',
      },
    },
    author_association: 'COLLABORATOR',
    active_lock_reason: null,
  },
  {
    url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/4',
    id: 541483946,
    node_id: 'MDExOlB1bGxSZXF1ZXN0NTQxNDgzOTQ2',
    html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/4',
    diff_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/4.diff',
    patch_url:
      'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/4.patch',
    issue_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/4',
    number: 4,
    state: 'closed',
    locked: false,
    title: 'Add workflows',
    user: {
      login: 'mcalus3',
      id: 24685983,
      node_id: 'MDQ6VXNlcjI0Njg1OTgz',
      avatar_url: 'https://avatars0.githubusercontent.com/u/24685983?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/mcalus3',
      html_url: 'https://github.com/mcalus3',
      followers_url: 'https://api.github.com/users/mcalus3/followers',
      following_url:
        'https://api.github.com/users/mcalus3/following{/other_user}',
      gists_url: 'https://api.github.com/users/mcalus3/gists{/gist_id}',
      starred_url:
        'https://api.github.com/users/mcalus3/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/mcalus3/subscriptions',
      organizations_url: 'https://api.github.com/users/mcalus3/orgs',
      repos_url: 'https://api.github.com/users/mcalus3/repos',
      events_url: 'https://api.github.com/users/mcalus3/events{/privacy}',
      received_events_url:
        'https://api.github.com/users/mcalus3/received_events',
      type: 'User',
      site_admin: false,
    },
    body: '',
    created_at: '2020-12-16T22:46:03Z',
    updated_at: '2020-12-18T07:40:23Z',
    closed_at: '2020-12-18T07:40:23Z',
    merged_at: '2020-12-18T07:40:23Z',
    merge_commit_sha: '9236eada698654324888a3736ae264552d2091a2',
    assignee: null,
    assignees: [],
    requested_reviewers: [
      {
        login: 'punkle',
        id: 553697,
        node_id: 'MDQ6VXNlcjU1MzY5Nw==',
        avatar_url: 'https://avatars1.githubusercontent.com/u/553697?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/punkle',
        html_url: 'https://github.com/punkle',
        followers_url: 'https://api.github.com/users/punkle/followers',
        following_url:
          'https://api.github.com/users/punkle/following{/other_user}',
        gists_url: 'https://api.github.com/users/punkle/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/punkle/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/punkle/subscriptions',
        organizations_url: 'https://api.github.com/users/punkle/orgs',
        repos_url: 'https://api.github.com/users/punkle/repos',
        events_url: 'https://api.github.com/users/punkle/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/punkle/received_events',
        type: 'User',
        site_admin: false,
      },
      {
        login: 'dtuite',
        id: 562403,
        node_id: 'MDQ6VXNlcjU2MjQwMw==',
        avatar_url: 'https://avatars3.githubusercontent.com/u/562403?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/dtuite',
        html_url: 'https://github.com/dtuite',
        followers_url: 'https://api.github.com/users/dtuite/followers',
        following_url:
          'https://api.github.com/users/dtuite/following{/other_user}',
        gists_url: 'https://api.github.com/users/dtuite/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/dtuite/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/dtuite/subscriptions',
        organizations_url: 'https://api.github.com/users/dtuite/orgs',
        repos_url: 'https://api.github.com/users/dtuite/repos',
        events_url: 'https://api.github.com/users/dtuite/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/dtuite/received_events',
        type: 'User',
        site_admin: false,
      },
      {
        login: 'martina-if',
        id: 736631,
        node_id: 'MDQ6VXNlcjczNjYzMQ==',
        avatar_url: 'https://avatars0.githubusercontent.com/u/736631?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/martina-if',
        html_url: 'https://github.com/martina-if',
        followers_url: 'https://api.github.com/users/martina-if/followers',
        following_url:
          'https://api.github.com/users/martina-if/following{/other_user}',
        gists_url: 'https://api.github.com/users/martina-if/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/martina-if/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/martina-if/subscriptions',
        organizations_url: 'https://api.github.com/users/martina-if/orgs',
        repos_url: 'https://api.github.com/users/martina-if/repos',
        events_url: 'https://api.github.com/users/martina-if/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/martina-if/received_events',
        type: 'User',
        site_admin: false,
      },
      {
        login: 'iain-b',
        id: 1415599,
        node_id: 'MDQ6VXNlcjE0MTU1OTk=',
        avatar_url: 'https://avatars0.githubusercontent.com/u/1415599?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/iain-b',
        html_url: 'https://github.com/iain-b',
        followers_url: 'https://api.github.com/users/iain-b/followers',
        following_url:
          'https://api.github.com/users/iain-b/following{/other_user}',
        gists_url: 'https://api.github.com/users/iain-b/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/iain-b/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/iain-b/subscriptions',
        organizations_url: 'https://api.github.com/users/iain-b/orgs',
        repos_url: 'https://api.github.com/users/iain-b/repos',
        events_url: 'https://api.github.com/users/iain-b/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/iain-b/received_events',
        type: 'User',
        site_admin: false,
      },
    ],
    requested_teams: [],
    labels: [],
    milestone: null,
    draft: false,
    commits_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/4/commits',
    review_comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/4/comments',
    review_comment_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
    comments_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/4/comments',
    statuses_url:
      'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/c3e61008f4c30a00cc47256d95bae9ae53ff0c0c',
    head: {
      label: 'RoadieHQ:add-workflows',
      ref: 'add-workflows',
      sha: 'c3e61008f4c30a00cc47256d95bae9ae53ff0c0c',
      user: {
        login: 'RoadieHQ',
        id: 61759275,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
        avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/RoadieHQ',
        html_url: 'https://github.com/RoadieHQ',
        followers_url: 'https://api.github.com/users/RoadieHQ/followers',
        following_url:
          'https://api.github.com/users/RoadieHQ/following{/other_user}',
        gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/RoadieHQ/subscriptions',
        organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
        repos_url: 'https://api.github.com/users/RoadieHQ/repos',
        events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/RoadieHQ/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 316212680,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTYyMTI2ODA=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'RoadieHQ/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'RoadieHQ',
          id: 61759275,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
          avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/RoadieHQ',
          html_url: 'https://github.com/RoadieHQ',
          followers_url: 'https://api.github.com/users/RoadieHQ/followers',
          following_url:
            'https://api.github.com/users/RoadieHQ/following{/other_user}',
          gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/RoadieHQ/subscriptions',
          organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
          repos_url: 'https://api.github.com/users/RoadieHQ/repos',
          events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/RoadieHQ/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: false,
        url: 'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/deployments',
        created_at: '2020-11-26T11:39:11Z',
        updated_at: '2020-12-31T21:24:07Z',
        pushed_at: '2021-01-07T18:14:05Z',
        git_url: 'git://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:RoadieHQ/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        homepage: null,
        size: 814,
        stargazers_count: 3,
        watchers_count: 3,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 1,
        open_issues: 5,
        watchers: 3,
        default_branch: 'main',
      },
    },
    base: {
      label: 'RoadieHQ:main',
      ref: 'main',
      sha: '14ae98cb591d4852df41148f1b978e4d4fcc4989',
      user: {
        login: 'RoadieHQ',
        id: 61759275,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
        avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/RoadieHQ',
        html_url: 'https://github.com/RoadieHQ',
        followers_url: 'https://api.github.com/users/RoadieHQ/followers',
        following_url:
          'https://api.github.com/users/RoadieHQ/following{/other_user}',
        gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
        subscriptions_url:
          'https://api.github.com/users/RoadieHQ/subscriptions',
        organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
        repos_url: 'https://api.github.com/users/RoadieHQ/repos',
        events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/RoadieHQ/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 316212680,
        node_id: 'MDEwOlJlcG9zaXRvcnkzMTYyMTI2ODA=',
        name: 'backstage-plugin-argo-cd',
        full_name: 'RoadieHQ/backstage-plugin-argo-cd',
        private: false,
        owner: {
          login: 'RoadieHQ',
          id: 61759275,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjYxNzU5Mjc1',
          avatar_url: 'https://avatars0.githubusercontent.com/u/61759275?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/RoadieHQ',
          html_url: 'https://github.com/RoadieHQ',
          followers_url: 'https://api.github.com/users/RoadieHQ/followers',
          following_url:
            'https://api.github.com/users/RoadieHQ/following{/other_user}',
          gists_url: 'https://api.github.com/users/RoadieHQ/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/RoadieHQ/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/RoadieHQ/subscriptions',
          organizations_url: 'https://api.github.com/users/RoadieHQ/orgs',
          repos_url: 'https://api.github.com/users/RoadieHQ/repos',
          events_url: 'https://api.github.com/users/RoadieHQ/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/RoadieHQ/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        description: 'A Backstage plugin for deployment tool ArgoCD',
        fork: false,
        url: 'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd',
        forks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/forks',
        keys_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/keys{/key_id}',
        collaborators_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/collaborators{/collaborator}',
        teams_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/teams',
        hooks_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/hooks',
        issue_events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/events{/number}',
        events_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/events',
        assignees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/assignees{/user}',
        branches_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/branches{/branch}',
        tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/tags',
        blobs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/blobs{/sha}',
        git_tags_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/tags{/sha}',
        git_refs_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/refs{/sha}',
        trees_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/trees{/sha}',
        statuses_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/{sha}',
        languages_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/languages',
        stargazers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/stargazers',
        contributors_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contributors',
        subscribers_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscribers',
        subscription_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/subscription',
        commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/commits{/sha}',
        git_commits_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/git/commits{/sha}',
        comments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/comments{/number}',
        issue_comment_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/comments{/number}',
        contents_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/contents/{+path}',
        compare_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/compare/{base}...{head}',
        merges_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/merges',
        archive_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/{archive_format}{/ref}',
        downloads_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/downloads',
        issues_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues{/number}',
        pulls_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls{/number}',
        milestones_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/milestones{/number}',
        notifications_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/notifications{?since,all,participating}',
        labels_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/labels{/name}',
        releases_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/releases{/id}',
        deployments_url:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/deployments',
        created_at: '2020-11-26T11:39:11Z',
        updated_at: '2020-12-31T21:24:07Z',
        pushed_at: '2021-01-07T18:14:05Z',
        git_url: 'git://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        ssh_url: 'git@github.com:RoadieHQ/backstage-plugin-argo-cd.git',
        clone_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd.git',
        svn_url: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd',
        homepage: null,
        size: 814,
        stargazers_count: 3,
        watchers_count: 3,
        language: 'TypeScript',
        has_issues: true,
        has_projects: false,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'apache-2.0',
          name: 'Apache License 2.0',
          spdx_id: 'Apache-2.0',
          url: 'https://api.github.com/licenses/apache-2.0',
          node_id: 'MDc6TGljZW5zZTI=',
        },
        forks: 1,
        open_issues: 5,
        watchers: 3,
        default_branch: 'main',
      },
    },
    _links: {
      self: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/4',
      },
      html: {
        href: 'https://github.com/RoadieHQ/backstage-plugin-argo-cd/pull/4',
      },
      issue: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/4',
      },
      comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/issues/4/comments',
      },
      review_comments: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/4/comments',
      },
      review_comment: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/comments{/number}',
      },
      commits: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls/4/commits',
      },
      statuses: {
        href:
          'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/statuses/c3e61008f4c30a00cc47256d95bae9ae53ff0c0c',
      },
    },
    author_association: 'COLLABORATOR',
    active_lock_reason: null,
  },
];
