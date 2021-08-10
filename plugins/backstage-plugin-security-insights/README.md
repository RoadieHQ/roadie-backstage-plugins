# GitHub Security Insights Plugin for Backstage

![a list of security alerts](https://raw.githubusercontent.com/RoadieHQ/backstage-plugin-security-insights/main/docs/roadie-backstage-security-plugin.jpg)

![a list of dependabot alerts](https://raw.githubusercontent.com/RoadieHQ/backstage-plugin-security-insights/main/docs/roadie-backstage-dependabot-alerts.png)

## Plugin Setup

1. If you have standalone app (you didn't clone this repo), then in the [packages/app](https://github.com/backstage/backstage/blob/master/packages/app/) directory of your backstage instance, add the plugin as a package.json dependency:

```bash
yarn add @roadiehq/backstage-plugin-security-insights
```

2. Import the plugin to the [entityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) source file:

```tsx
import {
  EntitySecurityInsightsContent
} from '@roadiehq/backstage-plugin-security-insights';


const serviceEntityPage = (
  <EntityPageLayout>
    ...
    <EntityLayout.Route
      path="/security-insights"
      title="Security Insights">
      <EntitySecurityInsightsContent />
    </EntityLayout.Route>
    ...
  </EntityPageLayout>
)
```

3. If you want to show dependabot alerts on your Backstage instance, make sure to import following code to the [entityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) source file:

```tsx
import {
  EntityGithubDependabotContent
} from '@roadiehq/backstage-plugin-security-insights';


const serviceEntityPage = (
  <EntityPageLayout>
    ...
    <EntityLayout.Route path="/dependabot" title="Dependabot">
      <EntityGithubDependabotContent/>
    </EntityLayout.Route>
    ...
  </EntityPageLayout>
)
```

4. Run backstage app with `yarn start` and navigate to services tabs.

## Widget setup

![a list of security alert](https://raw.githubusercontent.com/RoadieHQ/backstage-plugin-security-insights/main/docs/backstage-plugin-security-widget-1.png)

1. You must install plugin by following the steps above to add widgets to your Overview.

2. Add widget to your Overview tab:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  SecurityInsightsWidget,
  isSecurityInsightsAvailable,
} from '@roadiehq/backstage-plugin-security-insights';

...
const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    ...
    <EntitySwitch>
      <EntitySwitch.Case if={isSecurityInsightsAvailable}>
        <Grid item md={6}>
          <SecurityInsightsWidget/>
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
    ...
  </Grid>
);

```

## Features

- List detected vulnerabilities for your repository, with filtering and search.
- Show statistics widget about detected vulnerabilities for your repository.

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
