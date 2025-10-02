# GitHub Insights Plugin for Backstage

![a preview of the GitHub insights plugin](./docs/code-insights-plugin.png)

## Features

- Add GitHub Insights plugin tab.
- Show widgets about repository contributors, languages, readme, environments and release at overview page.

## Plugin Setup

1. Install the plugin:

```bash
cd packages/app
yarn add @roadiehq/backstage-plugin-github-insights
```

2. Add plugin API to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityGithubInsightsContent } from '@roadiehq/backstage-plugin-github-insights';

...

const serviceEntityPage = (
  <EntityLayoutWrapper>
    ...
    <EntityLayout.Route
      path="/code-insights"
      title="Code Insights">
      <EntityGithubInsightsContent />
    </EntityLayout.Route>
    ...
  </EntityLayoutWrapper>
);
```

3. Run backstage app with `yarn start` and navigate to services tabs.

## Widgets setup

1. You must install plugin by following the steps above to add widgets to your Overview. You might add only selected widgets or all of them.

2. Add widgets to your Overview tab:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityGithubInsightsContent,
  EntityGithubInsightsLanguagesCard,
  EntityGithubInsightsReadmeCard,
  EntityGithubInsightsReleasesCard,
  isGithubInsightsAvailable,
} from '@roadiehq/backstage-plugin-github-insights';

...

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
   <EntitySwitch>
      <EntitySwitch.Case if={isGithubInsightsAvailable}>
        <Grid item md={6}>
          <EntityGithubInsightsLanguagesCard />
          <EntityGithubInsightsReleasesCard />
        </Grid>
        <Grid item md={6}>
          <EntityGithubInsightsReadmeCard maxHeight={350} />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
  </Grid>
);

```

## Readme path

By default the plugin will use the annotation `github.com/project-slug` and get the root `README.md` from the repository. You can use a specific path by using the annotation `'github.com/project-readme-path': 'packages/sub-module/README.md'`. It can be useful if you have a component inside a monorepos.

### Widgets

#### Compliance Card

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityGithubInsightsComplianceCard } from '@roadiehq/backstage-plugin-github-insights';
```

![a preview of the compliance widget](docs/compliance-report-widget.png)

#### Contributors Card

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityGithubInsightsContributorsCard } from '@roadiehq/backstage-plugin-github-insights';
```

![a preview of the contributors widget](docs/contributors-widget.png)

#### Languages Card

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityGithubInsightsLanguagesCard } from '@roadiehq/backstage-plugin-github-insights';
```

![a preview of the languages widget](docs/languages-widget.png)

#### ReadMeCard

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityGithubInsightsReadmeCard } from '@roadiehq/backstage-plugin-github-insights';
```

![a preview of the compliance widget](docs/readme-widget.png)

Please note that the [workflow status badge](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge) feature in GitHub will not work with the Readme plugin.

#### ReleasesCard

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityGithubInsightsReleasesCard } from '@roadiehq/backstage-plugin-github-insights';
```

![a preview of the releases widget](docs/releases-widget.png)

#### EnvironmentsCard

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { EntityGithubInsightsEnvironmentsCard } from '@roadiehq/backstage-plugin-github-insights';
```

![a preview of the releases widget](docs/environments-widget.png)

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).

# New Frontend System

Follow these steps to detect and configure the GitHub Insights plugin if you'd like to use it in an application that supports the new Backstage frontend system.

### Package Detection

Once you installed the `@roadiehq/backstage-plugin-github-insights` package using your preferred package manager, you have to choose how the package should be detected by the Backstage frontend app. The package can be automatically discovered when the feature discovery config is set, or it can be manually enabled via code (for more granular package customization cases).

<table>
  <tr>
    <td>Via config</td>
    <td>Via code</td>
  </tr>
  <tr>
    <td>
      <pre lang="yaml">
        <code>
# app-config.yaml
  app:
    # Enable package discovery for all plugins
    packages: 'all'
  ---
  app:
    # Enable package discovery only for GitHub Insights
    packages:
      include:
        - '@roadiehq/backstage-plugin-github-insights'
        </code>
      </pre>
    </td>
    <td>
      <pre lang="javascript">
       <code>
// packages/app/src/App.tsx
import { createApp } from '@backstage/frontend-defaults';
import githubInsightsPlugin from '@roadiehq/backstage-plugin-github-insights/alpha';
//...
const app = createApp({
  // ...
  features: [
    //...
    githubInsightsPlugin,
  ],
});

//...
</code>

</pre>
</td>

  </tr>
</table>

### Extensions Configuration

Currently, the plugin installs 8 extensions: 1 api, 6 entity page cards (readme, compliance, releases, contributors, languages and environments) and 1 entity page content (also known as entity page tab), see below examples of how to configure the available extensions.

```yml
# app-config.yaml
app:
  extensions:
    # Example disabling the "readme" entity card
    - 'entity-card:github-insights/readme': false
    # Example customizing the "readme" entity card
    - 'entity-card:github-insights/readme':
        config:
          title: Documentation
          maxHeight: 100
    # Example disabling the "compliance" entity card
    - 'entity-card:github-insights/compliance': false
    # Example disabling the "releases" entity card
    - 'entity-card:github-insights/releases': false
    # Example disabling the "contributors" entity card
    - 'entity-card:github-insights/contributors': false
    # Example disabling the "languages" entity card
    - 'entity-card:github-insights/languages': false
    # Example disabling the "environments" entity card
    - 'entity-card:github-insights/environments': false
    # Example disabling the GitHub Insights entity content
    - 'entity-content:github-insights': false
    # Example customizing the GitHub Insights entity content
    - 'entity-content:github-insights':
        config:
          path: '/code-insights'
          title: 'Code Insights'
```
