---
'@roadiehq/backstage-plugin-buildkite': patch
---

Address issue #1490 to support the ability to only display default branch builds.

A `defaultBranchOnly` property can be set on the component, configuring the
component to dynamically detect the entity's default branch and only display
builds of that branch:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
export const cicdContent = (
  <EntitySwitch>
    <EntitySwitch.Case if={isBuildkiteAvailable}>
      <EntityBuildkiteContent defaultBranchOnly />
    </EntitySwitch.Case>
    ...
  </EntitySwitch>
);
```

Alternatively, the configuration can be also be set on a per-entity basis via
a `buildkite.com/default-branch-only` annotation whose value can be `true` or `false`:

```yaml
metadata:
  annotations:
    'buildkite.com/default-branch-only': 'true'
```

A `buildkite.com/branch` annotation takes precedence over both
`<EntityBuildkiteContent defaultBranchOnly />` and per-entity
`buildkite.com/default-branch-only` annotations.
