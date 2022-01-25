# Backstage Plugin Prometheus

Backstage plugin exposing graphs and alerts from Prometheus

![Prometheus Entity Content Page Screenshot](./docs/prom_entity_content.png)

## Features

- List Pull Requests for your repository, with filtering and search.
- Show basic statistics widget about pull requests for your repository.


### The plugin provides an entity content page and two additional widgets:
1. Alert table widget
2. Prometheus Graph widget
* Graph widget has two versions, line graph and an area graph


## Configuring

This plugin expects you to have Prometheus running with its API available to be called from Backstage.

## Install the plugin

```bash
cd packages/app
yarn add @roadiehq/backstage-plugin-prometheus
```

## Configure proxy for Prometheus
```yaml
# app.config.yaml

proxy: 
  '/prometheus/api':
    # url to the api and path of your hosted prometheus instance
    target: http://localhost:9090/api/v1/
    changeOrigin: true
    secure: false
    headers:
       Authorization: $YOUR_AUTH_TOKEN_IF_PROMETHEUS_IS_SECURED


# Defaults to /prometheus/api and can be omitted if proxy is configured for that url
prometheus:
   proxyPath: /prometheus/api

```


## Content page setup

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityPrometheusContent,
} from '@roadiehq/backstage-plugin-prometheus';
...

const serviceEntityPage = (
  <EntityLayout>
    ...
    <EntityLayout.Route path="/prometheus" title="Prometheus">
      <EntityPrometheusContent />
    </EntityLayout.Route>
    ...
  </EntityLayout>
```


## Widget

1. Install plugin by following the steps above to add widget to your Overview

2. Add widgets to your Overview tab:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityPrometheusAlertCard,  
  EntityPrometheusGraphCard,
} from '@roadiehq/backstage-plugin-prometheus';

...

const overviewContent = (
  <Grid container spacing={3}>
    ...
    <Grid item md={8}>
      <EntityPrometheusAlertCard />
    </Grid>
    <Grid item md={6}>
      <EntityPrometheusGraphCard />
    </Grid>
    ...
  </Grid>
);

```

## Entity annotations

The plugin uses entity annotations to determine what data to display. There are two different annotations that can be used:
1. Rule annotation to visualize [Prometheus recording rules](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/) and queries  
2. Alert annotation to display [Prometheus alerting rule](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) in a table format.

### Graphs

#### `prometheus.io/rule`

The 'rule' annotation expects a comma separated list of queries or recording rules and grouping dimension tuples. Dimension is optional and can be omitted which leads to the first label found from the returned data set to be used as the key to group items with. 

The annotation supports individual metrics, promQL queries or references to a name of a recording rule. For complex queries a recording rule is the preferred option, since annotation parsing prevents to usage of characters `,` and `|` in queries.

Example annotation
`prometheus.io/rule: memUsage|component,node_memory_active_bytes|instance,sum by (instance) (node_cpu_seconds_total)`

Produces the following graphs:
1. `memUsage|component`
   (grouping by component, otherwise `__name__` would be the first item on this saved rule. Showed here as an area graph)
   ![Area Graph widget](./docs/prom_areagraph_widget.png)

2. `node_memory_active_bytes|instance`
   (grouping by `instance`, image shows extra data on hover over a line.)
   ![Line graph with hover](./docs/prom_graph_hover.png)

3. `sum by (instance) (node_cpu_seconds_total)`
   (`instance` is the grouper label defined in the query --> it is returned on the result set as the first label name, and is therefore used to group data with.)
    ![Line Graph constructed by query](./docs/prom_graph_query.png)

### Alerts

#### `prometheus.io/alert`

The 'alert' annotation expects a comma separated list of predefined alert names from the Prometheus server. These are iterated and displayed in a table, displaying state, value, labels, evaluation time and annotations. To display all alerts configured in Prometheus a magic annotation `prometheus.io/alert: all` can be used. 

Example annotation
`prometheus.io/alert: 'Excessive Memory Usage'` produces the following table. 
![Alert table](./docs/prom_alert.png)


## Custom Graphs and Tables
For more customisability the package exports both `PrometheusGraph` and `PrometheusAlertStatus` as individual components. It is possible to create more customized graphs and/or tables using these directly by dynamically constructing props that these component are expecting. 

Type definition for `PrometheusGraph` props is:
```typescript
{
   query: string;
   range ? : {
      hours? : number;
      minutes? : number;
   };
   step ? : number;
   dimension ? : string;
   graphType ? : 'line' | 'area';
}
```

Type definition for `PrometheusAlertStatus' props is:
```typescript
{
  alerts: string[] | 'all';
}
```

## Links

- [Backstage](https://backstage.io)
- [Prometheus](https://prometheus.io/docs/introduction/overview/)
- [Prometheus Recording Rules](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/)
- Get hosted, managed Backstage for your company: https://roadie.io
