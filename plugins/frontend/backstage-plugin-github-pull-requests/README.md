# GitHub Pull Requests Plugin for Backstage

![a list of pull requests in the GitHub Pull Requests](https://raw.githubusercontent.com/RoadieHQ/backstage-plugin-github-pull-requests/main/docs/list-of-pull-requests-and-stats-tab-view.png)


## Repository migration notice

In order to make testing and deployment of our plugins easier we are migrating all Roadie plugins to a monorepo at https://github.com/RoadieHQ/roadie-backstage-plugins.
The plugins will still be published to the same place on NPM and will have the same package names so nothing should change for consumers of these plugins.

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

- List Pull Requests for your repository, with filtering and search functionnality like in github.
- Show basic statistics widget about pull requests for your repository.
- Possibility to add a variable on the backstage configuration of a catalog entity allowing to add a default search filter on github pull requests

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
