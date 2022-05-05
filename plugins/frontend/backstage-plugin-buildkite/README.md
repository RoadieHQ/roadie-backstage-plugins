# Buildkite CI/CD Plugin for Backstage

![a list of builds in the Buildkite plugin for Backstage](./docs/buildkite-plugin.png)

## Features

- List Buildkite CI/CD Builds
- Retrigger builds
- Inspect each builds step in real time

## How to add Buildkite project dependency to Backstage app

1. If you have standalone app (you didn't clone this repo), then do

```bash
yarn add @roadiehq/backstage-plugin-buildkite
```

2. Add proxy config:

```yaml
// app-config.yaml
proxy:
  '/buildkite/api':
    target: https://api.buildkite.com/v2/
    headers:
      Authorization: 'Bearer ${BUILDKITE_API_TOKEN}'
```

3. Import it into your Backstage application:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityBuildkiteContent,
  isPluginApplicableToEntity as isBuildkiteAvailable,
} from '@roadiehq/backstage-plugin-buildkite';
```

4. Add plugin API to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx

export const cicdContent = (
  <EntitySwitch>
    <EntitySwitch.Case if={isBuildkiteAvailable}>
      <EntityBuildkiteContent />
    </EntitySwitch.Case>
    ...
  </EntitySwitch>
);
```

## How to use Buildkite plugin in Backstage

1. Add annotation to the yaml config file of a component:

```yaml
metadata:
  annotations:
    buildkite.com/project-slug: [exampleorganization/exampleproject]
```

2. Get an api token from buildkite and export it to your shell.

```bash
export BUILDKITE_API_TOKEN=xxx-xxx-xxx
```

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
