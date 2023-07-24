# @roadiehq/backstage-plugin-github-pull-requests

## 2.5.14

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 2.5.13

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 2.5.12

### Patch Changes

- 608e1061: Release all

## 2.5.11

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 2.5.10

### Patch Changes

- 20286f59: extend 'avg time PR until merge' to display hours
- ef17db74: fix creator column size in pull request table
- e9b1c0c1: Add relative created from to pull request widget

## 2.5.9

### Patch Changes

- 0fe673e3: Version bumps

## 2.5.8

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 2.5.7

### Patch Changes

- 6bfd4ff5: feat: replaced moment by luxon

## 2.5.6

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 2.5.5

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 2.5.4

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 2.5.3

### Patch Changes

- 17104109: Fixed bug in PullRequestsTableView component where table layout did not readjust properly when table header text length exceeded.

## 2.5.2

### Patch Changes

- 1599cf96: release dependabot PRs

## 2.5.1

### Patch Changes

- 3a870726: Bump the `msw` dependency to `^1.0.1`

## 2.5.0

### Minor Changes

- 7dcfffa0: Display pull request descriptions on `PullRequestTable`

## 2.4.3

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 2.4.2

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 2.4.1

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 2.4.0

### Minor Changes

- c0bce517: Added new Group focussed widget

## 2.3.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 2.2.8

### Patch Changes

- eaa0bb2: update dependencies

## 2.2.7

### Patch Changes

- 99153fe: Move react-router and react-router-dom dependencies to peerDependencies because of the migration to the stabel version of react-router in backstage/backstage. See the migration guide [here](https://backstage.io/docs/tutorials/react-router-stable-migration#for-plugin-authors)

## 2.2.6

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 2.2.5

### Patch Changes

- dedfbc5: Fix label styling in `PullRequestsStatsCard`

## 2.2.4

### Patch Changes

- c9cfaad: Release all plugins after fixing typescript exports issue.

## 2.2.3

### Patch Changes

- a72a2a4: The homepage componenets will list 100 PRs

## 2.2.2

### Patch Changes

- 86eca6a: Update dependencies

## 2.2.1

### Patch Changes

- 8f8bbbb: Fix the types for the new query parameter on the homepage pullrequests plugin

## 2.2.0

### Minor Changes

- 3bdffc9: Added support for custom search queries for Homepage components

## 2.1.4

### Patch Changes

- e44cd57: Add skeleton as loading state instead of a progress bar

## 2.1.3

### Patch Changes

- 3b8e092: Check for cached access token to determine logged in state

## 2.1.2

### Patch Changes

- 1069b7b: Number of PRs label mapped to the respective combobox

## 2.1.1

### Patch Changes

- 6b4cc16: Update dependencies
  Add package information to the package.jsons, to tell the backstage cli how to run the tests

## 2.1.0

### Minor Changes

- d030f5f: Add avg lines of pr and avg files changed per PR metrics to the statistics card
- 49bda3d: Add review requests and your pull requests hompage components

### Patch Changes

- 1863e2a: Changed documentation to include entity switches

## 2.0.0

### Major Changes

- df841f0: Update dependecies to follow latest upstream version. Removed deprecated props of type 'Entity' passed into components as it is grabbed from context instead.

## 1.5.0

### Minor Changes

- f0421b4: Bumped to the latest upstream packages versions

## 1.4.6

### Patch Changes

- 5a2757c: Change notice headers to contain Larder Software Limited

## 1.4.5

### Patch Changes

- 9819e86: Renamed card names in '@roadiehq/backstage-plugin-github-pull-requests', so instead of 'Pull requests plugin' it will show 'Github Pull Requests'. In '@roadiehq/backstage-plugin-github-insights' 'Read me' card is renamed to 'Readme'.

## 1.4.4

### Patch Changes

- f5cd7e4: Update dependencies to latest Backstage packages

## 1.4.3

### Patch Changes

- 46b19a3: Update dependencies

## 1.4.2

### Patch Changes

- c779d9e: Update dependencies

## 1.4.1

### Patch Changes

- 7da7bfe: Update dependencies

## 1.4.0

### Minor Changes

- aa4f48d: Improve search functionality, so it supports searching per author and type of PR. This is a common pattern used in GitHub, so implementing it also for our plugin.

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
