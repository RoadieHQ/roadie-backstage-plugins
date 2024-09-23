# LaunchDarkly

Welcome to the LaunchDarkly plugin! It allows you to view feature flags on an entity page in Backstage for either a Project in a tab or a specific context in an entity card.

<img src="card-screenshot.png" alt="drawing" width="200"/>

## Getting started

Add a proxy configuration for LaunchDarkly in the `app-config.yaml` file

```yaml
proxy:
  '/launchdarkly/api':
    target: https://app.launchdarkly.com/api
    headers:
      Authorization: ${LAUNCHDARKLY_API_KEY}
```

### EntityLaunchdarklyContextOverviewCard

In the `packages/app/src/components/catalog/EntityPage.tsx` under `overviewContent` add the following:

```jsx
<EntitySwitch>
  <EntitySwitch.Case if={isLaunchdarklyContextAvailable}>
    <EntityLaunchdarklyContextOverviewCard />
  </EntitySwitch.Case>
</EntitySwitch>
```

### EntityLaunchdarklyProjectOverviewContent

In the `packages/app/src/components/catalog/EntityPage.tsx` under `serviceEntityPage` add the following:

```jsx
<EntityLayout.Route path="/launch-darkly-projects" title="LaunchDarkly">
  <EntityLaunchdarklyProjectOverviewContent />
</EntityLayout.Route>
```

Set the `LAUNCHDARKLY_API_KEY` environment variable and run the backstage backend.

Create an entity with the following annotations and import it:

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: launchdarklytest
  annotations:
    launchdarkly.com/project-key: default
    launchdarkly.com/environment-key: test
    launchdarkly.com/context: '{ "kind": "tenant", "key": "blah", "name": "blah" }'
spec:
  type: service
  lifecycle: unknown
  owner: 'group:engineering'
```

### Filtering flags

Add the additional annotations in order to filter flags by tags and/or query

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: launchdarklytest
  annotations:
    launchdarkly.com/project-key: default
    launchdarkly.com/environment-key: test
    launchdarkly.com/context: '{ "kind": "tenant", "key": "blah", "name": "blah" }'
    launchdarkly.com/filter-tags: '["tagged-flag"]'
    launchdarkly.com/filter-query: 'dark-mode'
spec:
  type: service
  lifecycle: unknown
  owner: 'group:engineering'
```
