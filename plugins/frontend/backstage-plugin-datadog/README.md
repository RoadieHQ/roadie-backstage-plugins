# Datadog Plugin for Backstage

Embed Datadog graphs and dashboards into Backstage.

Datadog is a monitoring service for cloud-scale applications, providing monitoring of servers, databases, tools, and services through a SaaS-based data analytics platform.

This readme will show you how to

- Setup and integrate the plugin into Backstage.
- Obtain the dashboard URL and graph tokens from Datadog that you will need for your metadata.
- Adding the annotations and the values from Datadog to your component's metadata file.
  <br/>
  <br/>

![dashboard](./docs/datadog-widget.png?raw=true)

## Setup and integrate the plugin into Backstage.

1. In the [packages/app](https://github.com/backstage/backstage/blob/master/packages/app/) directory of your backstage instance, add the plugin as a package.json dependency:

```shell
$ yarn add @roadiehq/backstage-plugin-datadog
```

2. import the plugin to the [entityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) source file:

```tsx
import {
  EntityDatadogContent,
  EntityDatadogGraphCard,
  isDatadogGraphAvailable,
} from '@roadiehq/backstage-plugin-datadog';
```

4. Add a Datadog card to the overview tab to the [entityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) source file:

```tsx
const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    ...
    <EntitySwitch>
      <EntitySwitch.Case if={isDatadogGraphAvailable}>
        <Grid item>
          <EntityDatadogGraphCard />
        </Grid>
      </EntitySwitch.Case>
    </EntitySwitch>
    ...
  </Grid>
);
```

5. Add a Datadog tab to the [entityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) source file:

```tsx
const serviceEntityPage = (
  <EntityPageLayout>
    ...
    <EntityLayout.Route path="/datadog" title="Datadog">
      <EntityDatadogContent />
    </EntityLayout.Route>
    ...
  </EntityPageLayout>
);
```

## Specify datadog domain

Datadog embedded graph is using `datadoghq.eu`as default top-level domain, when other is not specified. If you are using other domain, you need to specify it with corresponding annotations `datadoghq.com/site`.

### Adding the annotations and the values from Datadog to your component's metadata file.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: sample-service
  description: |
    A sample service
  annotations:
    datadoghq.com/site: <<DATADOGDOMAIN>>
```

## Embed a datadog dashboard in Backstage

### Obtain the dashboard URL from Datadog that you will need for your metadata.

- Login to your Datadog account.

### Get the dashboard URL.

- Navigate to the dashboards list by hovering over dashboards on the page's left-hand side and selecting the dashboard list.

- Select a dashboard from this list.

- Within the dashboard you have chosen, click the settings cog on the screen's right-hand side, circled in red.

![dashboard](./docs/dd-dashboard.png?raw=true)

- Copy the URL from the Sharing textbox.

- This URL is the value you need for the `datadoghq.com/dashboard-url` annotation.

![dashboard share](./docs/dd-dashboard-share.png?raw=true)

### Adding the annotations and the values from Datadog to your component's metadata file.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: sample-service
  description: |
    A sample service
  annotations:
    datadoghq.com/dashboard-url: datadoghq.com
```

## Embed a datadog graph in Backstage

- Login to your Datadog account.

### Get the graph token.

- Click on the graph pencil, circled in red, from your dashboard.

![dashboard](./docs/dd-dashboard-2.png?raw=true)

- Click on the Share tab, choose a timeframe, graph size and legend. Click generate the embedded code.

- Copy the token value that is highlighted in the red square.

- this token is the value you need for the `datadoghq.com/graph-token` annotation

![dashboard](./docs/dd-graph-share.png?raw=true)

### Customize graph size.

- In order to customize size of the graph you may specify `datadoghq.com/graph-size` annotations and specify one of the following options:

- 'small'
- 'medium'
- 'large'
- 'x-large';

If not specified, your graph will be 'medium' size per default.

### Adding the annotations and the values from Datadog to your component's metadata file.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: sample-service
  description: |
    A sample service
  annotations:
    datadoghq.com/graph-token: <<TOKEN>
```

## What it looks like

### For the dashboard

Navigate to the Datadog tab, and you will see your dashboard.
![dashboard share](./docs/dd-backstage-tab.png?raw=true)

### For the graph

Navigate to the overview tab for your component. And you will see the graph.
![dashboard share](./docs/dd-graph-overview.png?raw=true)

## Security

A word of note regarding the security of the datadog dashboards and graphs.

The instructions provided for sharing dashboards and graphs generate a URL.

This URL is public to anyone who bears it.

If obtained by another actor, it is usable by them.

## Contributing

Everyone is welcome to contribute to this repository. Feel free to raise [issues](https://github.com/RoadieHQ/backstage-plugin-datadog/issues) or to submit [Pull Requests](https://github.com/RoadieHQ/backstage-plugin-datadog/pulls).

[Join our Discord server!](https://discord.gg/cjv6H6m8VN)

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
