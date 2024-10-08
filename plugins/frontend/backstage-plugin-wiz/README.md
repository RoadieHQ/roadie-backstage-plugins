# Wiz Plugin for Backstage

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

- Shows graph with number of resolved and open issues over time

Severity chart Component:

- Shows graph of issues grouped by severity, over time

## Prerequisites

To begin using Wiz plugin, you will need the following parameters:

- API endpoint URL
- OAuth token

In order to retrieve those, you can read official documentation (https://win.wiz.io/reference/prerequisites) where it is described how to obtain them.

Both of these will be used for API calls and fetching data for project.

## How to add Wiz plugin dependency to Backstage app

1. If you have standalone app (i.e., you didn't clone this repo), then do

```bash
cd packages/app
yarn add @roadiehq/backstage-plugin-wiz
```

2. Add proxy config:

```yaml
// app-config.yaml
proxy:
    '/wiz/api':
    target: https://api.<TENANT_DATA_CENTER>.app.wiz.io/graphql
    headers:
      Accept: 'application/json'
      Content-Type : 'application/json'
      Authorization: 'Bearer ${WIZ_API_TOKEN}'
```

The Wiz GraphQL API has a single endpoint
https://api.<TENANT_DATA_CENTER>.app.wiz.io/graphql, where <TENANT_DATA_CENTER> is the Wiz regional data center your tenant resides, e.g., us1, us2, eu1 or eu2.

WIZ_API_TOKEN needs to be set in a format of 'Bearer {OAuth token}'

3. Add plugin component to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityWizIssues,
  isWizAvailable,
  EntityIssuesWidget,
  EntityIssuesChart,
  EntitySeverityChart,
} from '@roadiehq/backstage-plugin-wiz';

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    ...
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
  </Grid>
);
```

## How to use Wiz plugin in Backstage

1. Add annotation to the yaml config file of a component:

```yaml
metadata:
  annotations:
    wiz/project-id: <your-project-id>
```
