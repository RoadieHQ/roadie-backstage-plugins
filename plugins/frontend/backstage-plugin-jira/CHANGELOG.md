# @roadiehq/backstage-plugin-jira

## 2.4.9

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 2.4.8

### Patch Changes

- b593ed34: Allow to hide issue filter by configuration

## 2.4.7

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 2.4.6

### Patch Changes

- 608e1061: Release all

## 2.4.5

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 2.4.4

### Patch Changes

- 0fe673e3: Version bumps

## 2.4.3

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 2.4.2

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 2.4.1

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 2.4.0

### Minor Changes

- 185d1c69: feat: added filtering by label

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 2.3.5

### Patch Changes

- 1599cf96: release dependabot PRs

## 2.3.4

### Patch Changes

- 3a870726: Bump the `msw` dependency to `^1.0.1`

## 2.3.3

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 2.3.2

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 2.3.1

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 2.3.0

### Minor Changes

- 7e45fbbe: Add support for authenticated Jira proxy via Identity API

## 2.2.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 2.1.6

### Patch Changes

- eaa0bb2: update dependencies

## 2.1.5

### Patch Changes

- 0ca1b2c: Fix project url to keep the context path of a Jira server setup.

## 2.1.4

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 2.1.3

### Patch Changes

- c9cfaad: Release all plugins after fixing typescript exports issue.

## 2.1.2

### Patch Changes

- 86eca6a: Update dependencies

## 2.1.1

### Patch Changes

- 942eb3a: Fixed malformed URL when the confluenceActivityFilter is being used

## 2.1.0

### Minor Changes

- 8aa881e: Added a new way to fetch the issues and count them. Added a functionality to filter the activity stream by component name (if present). What's more, if Confluence is also configured and connected to your JIRA instance, you might need to define the `jira.confluenceActivityFilter` variable in your `app-config.yaml` to avoid those activities to be shown in your Activity Stream.

  In case the annotation `jira/component` is not present, the plugin will work exactly in the same way as in the previous versions.

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
