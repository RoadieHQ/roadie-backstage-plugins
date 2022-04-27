# @roadiehq/backstage-plugin-github-insights

## 2.0.1

### Patch Changes

- 6b4cc16: Update dependencies
  Add package information to the package.jsons, to tell the backstage cli how to run the tests

## 2.0.0

### Major Changes

- df841f0: Update dependecies to follow latest upstream version. Removed deprecated props of type 'Entity' passed into components as it is grabbed from context instead.

## 1.6.0

### Minor Changes

- f0421b4: Bumped to the latest upstream packages versions

## 1.5.5

### Patch Changes

- 9819e86: Renamed card names in '@roadiehq/backstage-plugin-github-pull-requests', so instead of 'Pull requests plugin' it will show 'Github Pull Requests'. In '@roadiehq/backstage-plugin-github-insights' 'Read me' card is renamed to 'Readme'.

## 1.5.4

### Patch Changes

- f5cd7e4: Update dependencies to latest Backstage packages

## 1.5.3

### Patch Changes

- 3296262: update imports for @backstage/catalog-model to remove deprecated imports
- 46b19a3: Update dependencies

## 1.5.2

### Patch Changes

- c779d9e: Update dependencies

## 1.5.1

### Patch Changes

- 7da7bfe: Update dependencies

## 1.5.0

### Minor Changes

- eb94c37: Add state to cache response from the github api

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

- 3de124a: Bump github insights plugin

## 1.4.2

### Patch Changes

- 49abec7: Update patch to release new changes.

## 1.4.1

### Patch Changes

- a728fd1: Update underlying packages and release.

## 1.4.0

### Minor Changes

- ed90f25: Breaking dependency updates for @backstage/core-app-api, @backstage/test-utils, @backstage/core-plugin-api, @backstage/backend-common && @backstage/integration

## 1.3.4

### Patch Changes

- 773692a: Change default port of backend from 7000 to 7007.

  This is due to the AirPlay Receiver process occupying port 7000 and preventing local Backstage instances on MacOS to start.

## 1.3.3

### Patch Changes

- 2a2b49f: Using 'backstage.io/source-location' annotation instead of default ('backstage/managed-by-location) into account if it is noted in config file.

## 1.3.2

### Patch Changes

- 4d426f9: Updated dependencies to follow latest Backstage release

## 1.3.1

### Patch Changes

- 3f280ef: Updated 'msw' package version in order to correctly run tests.
