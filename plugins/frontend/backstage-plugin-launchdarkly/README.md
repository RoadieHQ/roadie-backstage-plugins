# launchdarkly

Welcome to the launchdarkly plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Add a proxy configuration for LaunchDarkly in the `app-config.yaml` file

```
proxy:
  '/launchdarkly/api':
    target: https://app.launchdarkly.com/api
    headers:
      Authorization: ${LAUNCHDARKLY_API_KEY}
```

In the `packages/app/src/components/catalog/EntityPage.tsx` under `overviewContent` add the following:

```
<EntitySwitch>
  <EntitySwitch.Case if={isLaunchdarklyAvailable}>
      <EntityLaunchdarklyOverviewCard />
  </EntitySwitch.Case>
</EntitySwitch>
```

Set the `LAUNCHDARKLY_API_KEY` environment variable and run the backstage backend.

Create an entity with the following annotations and import it:

```
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: launchdarklytest
  annotations:
    launchdarkly.com/project-key: default
    launchdarkly.com/environment-key: test
    launchdarkly.com/context: "{ \"kind\": \"tenant\", \"key\": \"blah\", \"name\": \"blah\" }"
spec:
  type: service
  lifecycle: unknown
  owner: 'group:engineering'
```
