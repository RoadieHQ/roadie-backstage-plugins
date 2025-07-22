# @roadiehq/backstage-plugin-bugsnag

## 2.3.0

### Minor Changes

- f215405: Upgrade to 1.40.2

## 2.2.13

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.

## 2.2.12

### Patch Changes

- 6847280: added keywords to all plugins

## 2.2.11

### Patch Changes

- 2718d81: Add link to Roadie in README

## 2.2.10

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata

## 2.2.9

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5

## 2.2.8

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

## 2.2.7

### Patch Changes

- 23195a8: Version bump to backstage 1.23.3

## 2.2.6

### Patch Changes

- 6d5e4bf: Release all of the packages

## 2.2.5

### Patch Changes

- aef7096: Fix failed release

## 2.2.4

### Patch Changes

- f7287ee: Bump to backstage@1.21.1

## 2.2.3

### Patch Changes

- 87f90089: Version bump to Backstage 1.20.3

## 2.2.2

### Patch Changes

- 9bb000a6: Version bump to Backstage 1.19.6

## 2.2.1

### Patch Changes

- c6b0af08: Bump plugins version to backstage version 1.18.3

## 2.2.0

### Minor Changes

- 8c3a3456: **BREAKING** Change the `bugsnag.com/project-key` annotation from `OrganizationName/projectApiKey` to `OrganizationName/ProjectName`.

  This change allows (optionally) changing the content of the `bugsnag.com/project-key` annotation to `Organization name/Project name`. As this already contains the project name, the `bugsnag.com/project-name` annotation becomes deprecated. Configuring the plugin this way makes more sense, as the secret api-key can be kept out of the repositories. The plugin will detect if the plugin is configured with an old annotation, and revert to the old behaviour if needed.

  Improve the display of data in the table:

  - It adds the description and the status to the table.
  - It adds filtering options to the table.

  Bugfixes:

  - Don't throw an error if the annotation is missing.
  - If there are multiple stages, they are now joined with a comma.

## 2.1.15

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

## 2.1.14

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 2.1.13

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 2.1.12

### Patch Changes

- 608e1061: Release all

## 2.1.11

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 2.1.10

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 2.1.9

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 2.1.8

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 2.1.7

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 2.1.6

### Patch Changes

- 1599cf96: release dependabot PRs

## 2.1.5

### Patch Changes

- 3a870726: Bump the `msw` dependency to `^1.0.1`

## 2.1.4

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 2.1.3

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 2.1.2

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 2.1.1

### Patch Changes

- b7a7536a: Fix circular dependencies.

## 2.1.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 2.0.6

### Patch Changes

- 073190b9: Update luxon to version 3.

## 2.0.5

### Patch Changes

- eaa0bb2: update dependencies

## 2.0.4

### Patch Changes

- 151b46b: bump to latest backstage package versions

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

## 1.5.0

### Minor Changes

- f0421b4: Bumped to the latest upstream packages versions

## 1.4.7

### Patch Changes

- f5cd7e4: Update dependencies to latest Backstage packages

## 1.4.6

### Patch Changes

- 46b19a3: Update dependencies

## 1.4.5

### Patch Changes

- c779d9e: Update dependencies

## 1.4.4

### Patch Changes

- 7da7bfe: Update dependencies

## 1.4.3

### Patch Changes

- 5ae1b4b: Update README.md files

## 1.4.2

### Patch Changes

- b5db653: Update dependecies to latest packages

## 1.4.1

### Patch Changes

- a02dbf5: Migrating to TestApiProvider in the tests

## 1.4.0

### Minor Changes

- 10bf6bf: Introduce new annotations in order to fix the limit with pagination and default of fetching 30 requests per page.

## 1.3.3

### Patch Changes

- 142ce1c: Moved React dependencies to `peerDependencies` and allow both React v16 and v17 to be used.

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
