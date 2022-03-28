# GitHub Pull Requests Plugin for Backstage

![a list of pull requests in the GitHub Pull Requests](./docs/list-of-pull-requests-and-stats-tab-view.png)

## Features

- List Pull Requests for your repository, with filtering and search.
- Show basic statistics widget about pull requests for your repository.



## Plugin Configuration Requirements

This plugin relies on the [GitHub Authentication Provider](https://backstage.io/docs/auth/github/provider) for its access to GitHub.

Search filter works the same way it works in GitHub, but `roadie-backstage-pull-requests/default-filter` annotation needs to be provided in component configuration. Adding a filter will result in applying that filter per default.

If this annotation is left out, no default filter will be applied when running the app.

## Install the plugin

```bash
cd packages/app
yarn add @roadiehq/backstage-plugin-github-pull-requests
```

## Add plugin API to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityGithubPullRequestsContent,
  isGithubPullRequestsAvailable,
} from '@roadiehq/backstage-plugin-github-pull-requests';
...

const serviceEntityPage = (
  <EntityLayout>
    ...
    <EntityLayout.Route
      path="/pull-requests"
      title="Pull Requests"
      if={isGithubPullRequestsAvailable}
    >
      <EntityGithubPullRequestsContent />
    </EntityLayout.Route>
    ...
  </EntityLayout>
```

4. Run backstage app with `yarn start` and navigate to services tabs.

## Widget setup

![a list of pull requests in the GitHub Pull Requests](./docs/github-pullrequests-widget.png)

1. You must install plugin by following the steps above to add widget to your Overview

2. Add widget to your Overview tab:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityGithubPullRequestsOverviewCard, isGithubPullRequestsAvailable } from '@roadiehq/backstage-plugin-github-pull-requests';

...

const overviewContent = (
  <Grid container spacing={3}>
    ...
    <EntitySwitch>
      <EntitySwitch.Case if={isGithubPullRequestsAvailable}>
        <Grid item md={6}>
          <EntityGithubPullRequestsOverviewCard />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
    ...
  </Grid>
);

```

## Features

- List Pull Requests for your repository, with filtering and search (The searchbar is working like in github).
- Show basic statistics widget about pull requests for your repository.
- Possibility to add a variable on the backstage configuration of a catalog entity allowing to add a default search filter on github pull requests

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
