# Wiz Plugin for Backstage

This plugin is the frontend for WIZ Backend Backstage plugin. You can see the corresponding backend plugin in [here](/plugins/backend/wiz-backend/README.md).

![a Wiz plugin for Backstage](./docs/wiz-issues.png).
![a Wiz issues expanded](./docs/wiz-expanded-issues.png)
![a Wiz plugin Issues View](./docs/issues-widget.png).
![a Wiz plugin Issues Charts View](./docs/issues-chart.png).
![a Wiz plugin Severity Charts View](./docs/severity-graph.png).

## Features

Wiz Issues Component:

- Shows issues for the project, grouped by Controls

Issues widget Component:

- Shows number of open issues grouped by severity

Issues chart Component:

- Shows graph with number of resolved and open issues for last 6 months

Severity chart Component:

- Shows graph of issues grouped by severity, over time of last 6 months

## Getting started

Make sure you have installed [WIZ backend plugin](/plugins/backend/wiz-backend/README.md). This will generate access token needed for retriving and displaying issues in components.

### Add plugin component to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityWizIssues,
  isWizAvailable,
  EntityIssuesWidget,
  EntityIssuesChart,
  EntitySeverityChart,
} from '@roadiehq/backstage-plugin-wiz';
```

### Add widgets: EntityIssuesWidget, EntityIssuesChart, EntitySeverityChart

In the `packages/app/src/components/catalog/EntityPage.tsx` under `overviewContent` add the following, based on which card (widget) you want to display:

```jsx
<EntitySwitch>
  <EntitySwitch.Case if={isWizAvailable}>
    <Grid item md={6}>
      <EntityIssuesWidget />
    </Grid>
  </EntitySwitch.Case>
</EntitySwitch>

<EntitySwitch>
  <EntitySwitch.Case if={isWizAvailable}>
    <Grid item md={6}>
      <EntityIssuesChart />
    </Grid>
  </EntitySwitch.Case>
</EntitySwitch>

<EntitySwitch>
  <EntitySwitch.Case if={isWizAvailable}>
    <Grid item md={6}>
      <EntitySeverityChart />
    </Grid>
  </EntitySwitch.Case>
</EntitySwitch>
```

### EntityWizIssues

In the `packages/app/src/components/catalog/EntityPage.tsx` under `serviceEntityPage` add the following:

```jsx
<EntityLayout.Route path="/wiz" title="WIZ">
  <EntityWizIssues />
</EntityLayout.Route>
```

This will add a new tab with all the issues for the project id you have specified in annotations.

## How to use add correct annotations

1. Add annotation to the yaml config file of a component:

```yaml
metadata:
  annotations:
    wiz/project-id: <your-project-id>
```
