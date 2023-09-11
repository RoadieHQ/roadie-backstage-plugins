# @roadiehq/backstage-plugin-github-insights

## 2.3.19

### Patch Changes

- 86721387: The `MarkdownContent` component currently removes only single line comments if `preserveHtmlComments` is not set.
  This change accounts for single line and multiline HTML comments

## 2.3.18

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

## 2.3.17

### Patch Changes

- 4abae0b2: Fix issue where .environment may be not available

## 2.3.16

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 2.3.15

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 2.3.14

### Patch Changes

- 608e1061: Release all

## 2.3.13

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 2.3.12

### Patch Changes

- 871c4584: use style theme in ComplianceCard

## 2.3.11

### Patch Changes

- 0fe673e3: Version bumps

## 2.3.10

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 2.3.9

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 2.3.8

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 2.3.7

### Patch Changes

- 199311f4: Fix branch resolution on markdown links in the Readme card.

## 2.3.6

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

- 8afcb30a: Fix the readme plugin to support readme files from github enterprise.

## 2.3.0

### Minor Changes

- 8c8864eb: Fix the readme card to support relative and absolute urls in the readme file. This also includes a major refactor of the code in this area.

## 2.2.2

### Patch Changes

- fbe578a4: Allow rendering svgs on readme plugin.

## 2.2.1

### Patch Changes

- a49f724f: added card presenting environments lists

## 2.2.0

### Minor Changes

- 3686f93c: Fix languages card causing crash when undefined

## 2.1.3

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 2.1.2

### Patch Changes

- 45d1c773: Allow setting the `README` card title.

## 2.1.1

### Patch Changes

- f4bf2b22: fix issue where languages card is empty when no languages are detected. empty language cards are no longer shown.

## 2.1.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 2.0.6

### Patch Changes

- eaa0bb2: update dependencies

## 2.0.5

### Patch Changes

- 99153fe: Move react-router and react-router-dom dependencies to peerDependencies because of the migration to the stabel version of react-router in backstage/backstage. See the migration guide [here](https://backstage.io/docs/tutorials/react-router-stable-migration#for-plugin-authors)

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
