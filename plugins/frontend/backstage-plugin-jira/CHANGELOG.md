# @roadiehq/backstage-plugin-jira

## 2.0.3

### Patch Changes

- 912993b: Update dependencies for the JIRA plugin. This fixes a theming issue in Backstage 1.1.1

  WHY: Theming issue found while running the plugin with the latest version of Backstage

  No breaking changes are expected here.

## 2.0.2

### Patch Changes

- c263913: Fixes the proxy path override, now you can define a `jira.proxyPath` variable in your `app-config.yaml` file to provide the path of your proxy.

## 2.0.1

### Patch Changes

- 6b4cc16: Update dependencies
  Add package information to the package.jsons, to tell the backstage cli how to run the tests

## 2.0.0

### Major Changes

- df841f0: Update dependecies to follow latest upstream version. Removed deprecated props of type 'Entity' passed into components as it is grabbed from context instead.

## 1.5.0

### Minor Changes

- f0421b4: Bumped to the latest upstream packages versions

## 1.4.12

### Patch Changes

- 5a2757c: Change notice headers to contain Larder Software Limited

## 1.4.11

### Patch Changes

- f5cd7e4: Update dependencies to latest Backstage packages

## 1.4.10

### Patch Changes

- 46b19a3: Update dependencies

## 1.4.9

### Patch Changes

- c779d9e: Update dependencies

## 1.4.8

### Patch Changes

- 7da7bfe: Update dependencies

## 1.4.7

### Patch Changes

- 5ae1b4b: Update README.md files

## 1.4.6

### Patch Changes

- b5db653: Update dependecies to latest packages

## 1.4.5

### Patch Changes

- a02dbf5: Migrating to TestApiProvider in the tests

## 1.4.4

### Patch Changes

- 142ce1c: Moved React dependencies to `peerDependencies` and allow both React v16 and v17 to be used.

## 1.4.3

### Patch Changes

- ecd06f5: Make "@backstage/core-app-api" a dev dependency

## 1.4.2

### Patch Changes

- 49abec7: Update patch to release new changes.

## 1.4.1

### Patch Changes

- a728fd1: Update underlying packages and release.

## 1.4.0

### Minor Changes

- ed90f25: Breaking dependency updates for @backstage/core-app-api, @backstage/test-utils, @backstage/core-plugin-api, @backstage/backend-common && @backstage/integration

## 1.3.2

### Patch Changes

- 120ca2e: Removed deprecated `description` option from `ApiRefConfig` for all plugins

## 1.3.1

### Patch Changes

- 4d426f9: Updated dependencies to follow latest Backstage release

## 1.3.0

### Minor Changes

- 3f280ef: Provided an option to use Bearer token to retrieve activity stream.
