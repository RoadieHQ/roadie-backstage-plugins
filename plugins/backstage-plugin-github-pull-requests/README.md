# GitHub Pull Requests Plugin for Backstage

![a list of pull requests in the GitHub Pull Requests](https://raw.githubusercontent.com/RoadieHQ/backstage-plugin-github-pull-requests/main/docs/list-of-pull-requests-and-stats-tab-view.png)


## Notice

If you have previously used this plugin you will be noticing some changes. In order to increase usability of our plugins and make testing and integration process straightforward and easy we are currently working on re-structuring and re-organising our plugins workflows and architecture.

We have decided to gather all of our plugins repositories in one place, so it is easier to find everything you need, which will boost the usage and hopefully give better overview of everything you can achieve with Backstage.

From now on, this plugin will be contained inside https://github.com/RoadieHQ/backstage-roadie-plugins repository, which will gather all of the plugins we, at Roadie, have worked on.

Updated instructions could be found below:

## Plugin Configuration Requirements

This plugin relies on the [GitHub Authentication Provider](https://backstage.io/docs/auth/github/provider) for its access to GitHub.

## Install the plugin

```bash
cd packages/app
yarn add @roadiehq/backstage-plugin-github-pull-requests
```

## Add plugin API to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityGithubPullRequestsContent } from '@roadiehq/backstage-plugin-github-pull-requests';
...

const serviceEntityPage = (
  <EntityLayout>
    ...
    <EntityLayout.Route path="/pull-requests" title="Pull Requests">
      <EntityGithubPullRequestsContent />
    </EntityLayout.Route>
    ...
  </EntityLayout>
```

4. Run backstage app with `yarn start` and navigate to services tabs.

## Widget setup

![a list of pull requests in the GitHub Pull Requests](https://raw.githubusercontent.com/RoadieHQ/backstage-plugin-github-pull-requests/main/docs/github-pullrequests-widget.png)

1. You must install plugin by following the steps above to add widget to your Overview

2. Add widget to your Overview tab:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityGithubPullRequestsOverviewCard } from '@roadiehq/backstage-plugin-github-pull-requests';

...

const overviewContent = (
  <Grid container spacing={3}>
    ...
    <Grid item md={6}>
      <EntityGithubPullRequestsOverviewCard />
    </Grid>
    ...
  </Grid>
);

```

## Features

- List Pull Requests for your repository, with filtering and search.
- Show basic statistics widget about pull requests for your repository.

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
