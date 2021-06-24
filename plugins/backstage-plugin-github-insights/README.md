# GitHub Insights Plugin for Backstage

![a preview of the GitHub insights plugin](https://raw.githubusercontent.com/RoadieHQ/backstage-plugin-code-insights/main/docs/code-insights-plugin.png)

## Repository migration notice (June/July 2021)

In order to make testing and deployment of our plugins easier we are migrating all Roadie plugins to a monorepo at https://github.com/RoadieHQ/roadie-backstage-plugins.
The plugins will still be published to the same place on NPM and will have the same package names so nothing should change for consumers of these plugins.

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
  </EntityLayoutWrapper>
);
```

4. Run backstage app with `yarn start` and navigate to services tabs.

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

## Features

- Add GitHub Insights plugin tab.
- Show widgets about repository contributors, languages, readme and release at overview page.

### Widgets

#### Compliance Card
```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
EntityGithubInsightsComplianceCard
} from '@roadiehq/backstage-plugin-github-insights';
```
![a preview of the compliance widget](docs/compliance-report-widget.png)

#### Contributors Card
```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
EntityGithubInsightsContributorsCard
} from '@roadiehq/backstage-plugin-github-insights';
```
![a preview of the contributors widget](docs/contributors-widget.png)

#### Languages Card
```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
EntityGithubInsightsLanguagesCard
} from '@roadiehq/backstage-plugin-github-insights';
```
![a preview of the languages widget](docs/languages-widget.png)

#### ReadMeCard
```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
EntityGithubInsightsReadmeCard
} from '@roadiehq/backstage-plugin-github-insights';
```
![a preview of the compliance widget](docs/readme-widget.png)
#### ReleasesCard
```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
EntityGithubInsightsReleasesCard
} from '@roadiehq/backstage-plugin-github-insights';
```
![a preview of the releases widget](docs/releases-widget.png)

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
