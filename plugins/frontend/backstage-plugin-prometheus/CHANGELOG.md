# @roadiehq/backstage-plugin-prometheus

## 3.2.0

### Minor Changes

- c2274f9: Upgrade backstage version to `1.44.2`.

## 3.1.0

### Minor Changes

- f215405: Upgrade to 1.40.2

## 3.0.0

### Major Changes

- 69c8f6d: Customisation improvements:

  - Add `extraColumns` prop to `EntityPrometheusAlertCard` & `EntityPrometheusContent`
  - Add `showAnnotations` prop to `EntityPrometheusAlertCard` & `EntityPrometheusContent`
  - Add `showLabels` prop to `EntityPrometheusAlertCard` & `EntityPrometheusContent`

  Fixes:

  - Fix #1823 to support multiple instances of Prometheus.
  - Move import of `MissingAnnotationEmptyState` to `@backstage/plugin-catalog-react` to clear deprecation warning.

## 2.11.4

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.

## 2.11.3

### Patch Changes

- 6847280: added keywords to all plugins

## 2.11.2

### Patch Changes

- 2718d81: Add link to Roadie in README

## 2.11.1

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata

## 2.11.0

### Minor Changes

- f4a5909: Allow the title to be set on the prometheus entity card.

## 2.10.0

### Minor Changes

- 6546676: Allow setting the query on the card.

## 2.9.0

### Minor Changes

- 690f23f: Fixes the tick date format issue described here: https://github.com/RoadieHQ/roadie-backstage-plugins/issues/1306

## 2.8.8

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5

## 2.8.7

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

## 2.8.6

### Patch Changes

- 23195a8: Version bump to backstage 1.23.3

## 2.8.5

### Patch Changes

- 6d5e4bf: Release all of the packages

## 2.8.4

### Patch Changes

- aef7096: Fix failed release

## 2.8.3

### Patch Changes

- f7287ee: Bump to backstage@1.21.1

## 2.8.2

### Patch Changes

- 87f90089: Version bump to Backstage 1.20.3

## 2.8.1

### Patch Changes

- 9bb000a6: Version bump to Backstage 1.19.6

## 2.8.0

### Minor Changes

- e7c7ff99: Add condition to control the Prometheus cards display in the entity overview page

## 2.7.0

### Minor Changes

- 1078f16e: Add `uiUrl` as config to enable links to Prometheus.

## 2.6.1

### Patch Changes

- c6b0af08: Bump plugins version to backstage version 1.18.3

## 2.6.0

### Minor Changes

- d4fb212c: Prometheus service name will now be sent to the backstage backend proxy as a request header to support advanced proxying configs

## 2.5.0

### Minor Changes

- 7a7a0b5f: updated documentation links for MissingAnnotationEmptyState components

## 2.4.11

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

## 2.4.10

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 2.4.9

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 2.4.8

### Patch Changes

- 608e1061: Release all

## 2.4.7

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 2.4.6

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 2.4.5

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 2.4.4

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 2.4.3

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 2.4.2

### Patch Changes

- 1599cf96: release dependabot PRs

## 2.4.1

### Patch Changes

- 3a870726: Bump the `msw` dependency to `^1.0.1`

## 2.4.0

### Minor Changes

- 7c9fd336: Users can now add a callback to an `EntityPrometheusAlertCard` component. The component with callback can look like this:

  ```typescript
  <EntityPrometheusAlertCard onRowClick={callbackFunction} />
  ```

  And `callbackFunction` can have the following definition:

  ```typescript
  const callbackFunction = (arg: Alerts) => {
    ...
  };
  ```

  Where the `Alerts` type is a user-defined type to more easily parse JSON definition (`any` type can also be used). This callback is optional; if not supplied, tables in the row are not clickable.

  This change modifies `PrometheusAlertStatus`, which adds `onRowClick` event to a `Table` component.

## 2.3.0

### Minor Changes

- 87530639: Users can now define a new annotation, `prometheus.io/labels`. This annotation defines which labels will be included in the displayed table; if the annotation is not applied, the result is just filtered using `prometheus.io/alert` annotation. Example of usage:

  ```
  prometheus.io/labels: "label1=value1,label2=value2"
  ```

  This change modifies `useAlerts`, which adds filtering of alerts and adds a definition of new annotation. It also creates tests that verify this functionality.

## 2.2.3

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 2.2.2

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 2.2.1

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 2.2.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 2.1.3

### Patch Changes

- 073190b9: Update luxon to version 3.

## 2.1.2

### Patch Changes

- eaa0bb2: update dependencies

## 2.1.1

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 2.1.0

### Minor Changes

- 5b305b9: Add ability to use multiple instances over proxy annotation.

## 2.0.3

### Patch Changes

- c9cfaad: Release all plugins after fixing typescript exports issue.

## 2.0.2

### Patch Changes

- 86eca6a: Update dependencies

## 2.0.1

### Patch Changes

- 6b4cc16: Update dependencies
  Add package information to the package.jsons, to tell the backstage cli how to run the tests

## 2.0.0

### Major Changes

- df841f0: Update dependecies to follow latest upstream version. Removed deprecated props of type 'Entity' passed into components as it is grabbed from context instead.

## 1.4.0

### Minor Changes

- f0421b4: Bumped to the latest upstream packages versions

## 1.3.11

### Patch Changes

- f5cd7e4: Update dependencies to latest Backstage packages

## 1.3.10

### Patch Changes

- 46b19a3: Update dependencies

## 1.3.9

### Patch Changes

- c779d9e: Update dependencies

## 1.3.8

### Patch Changes

- 7da7bfe: Update dependencies

## 1.3.7

### Patch Changes

- 5ae1b4b: Update README.md files

## 1.3.6

### Patch Changes

- b5db653: Update dependecies to latest packages

## 1.3.5

### Patch Changes

- a02dbf5: Migrating to TestApiProvider in the tests

## 1.3.4

### Patch Changes

- 142ce1c: Moved React dependencies to `peerDependencies` and allow both React v16 and v17 to be used.

## 1.3.3

### Patch Changes

- ecd06f5: Make "@backstage/core-app-api" a dev dependency

## 1.3.2

### Patch Changes

- 49abec7: Update patch to release new changes.

## 1.3.1

### Patch Changes

- a728fd1: Update underlying packages and release.

## 1.3.0

### Minor Changes

- ed90f25: Breaking dependency updates for @backstage/core-app-api, @backstage/test-utils, @backstage/core-plugin-api, @backstage/backend-common && @backstage/integration

## 1.2.3

### Patch Changes

- 120ca2e: Removed deprecated `description` option from `ApiRefConfig` for all plugins

## 1.2.2

### Patch Changes

- 4d426f9: Updated dependencies to follow latest Backstage release

## 1.2.1

### Patch Changes

- 3f280ef: Updated 'msw' package version in order to correctly run tests.
