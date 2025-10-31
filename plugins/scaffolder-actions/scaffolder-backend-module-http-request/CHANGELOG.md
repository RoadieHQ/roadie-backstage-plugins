# @roadiehq/scaffolder-backend-module-http-request

## 5.5.0

### Minor Changes

- c2274f9: Upgrade backstage version to `1.44.2`.

## 5.4.2

### Patch Changes

- 7df343e: Fix casing bug in automatic json serialisation

## 5.4.1

### Patch Changes

- eab471e: Updated the `backstage.pluginId` to match the `pluginId` set in the `createBackendModule`

## 5.4.0

### Minor Changes

- f215405: Upgrade to 1.40.2

## 5.3.4

### Patch Changes

- ddeddb7: Updated timeout to use native functionality

## 5.3.3

### Patch Changes

- b7f31ad: Added timeout for the http request as input parameter

## 5.3.2

### Patch Changes

- 5eb9cc2: Move some `dependencies` into `devDependencies`.

## 5.3.1

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.

## 5.3.0

### Minor Changes

- e9c26c6: Update scaffolder packages, tidy up some imports

## 5.2.0

### Minor Changes

- 8915f83: We are making the logger compatible with Backstage's LoggerService and winston's Logger so that Roadie can be used with newer and older versions of Backstage.

## 5.1.0

### Minor Changes

- a61209b: Compatibility with Backstage 1.33+

## 5.0.1

### Patch Changes

- e85a28b: Remove import of scaffolder backend plugin.

## 5.0.0

### Major Changes

- 9fb8723: Deprecated the exports from `new-backend.ts` and re-export from `index.ts` as part of the transition to the new backend system

## 4.3.5

### Patch Changes

- 2718d81: Add link to Roadie in README

## 4.3.4

### Patch Changes

- 6a24c55: Fix authentication issue to be compatible to the latest backstage

## 4.3.3

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata

## 4.3.2

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5

## 4.3.1

### Patch Changes

- 005f979: Update README and entry point for scaffolder utils and http request actions.

## 4.3.0

### Minor Changes

- fcabd86: Update to new backend system

## 4.2.0

### Minor Changes

- a367778: Added array as possible body input type to http:backstage:request action

## 4.1.10

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

## 4.1.9

### Patch Changes

- f2e39a0: Backstage version bump to 1.23.4

## 4.1.8

### Patch Changes

- 23195a8: Version bump to backstage 1.23.3

## 4.1.7

### Patch Changes

- 6d5e4bf: Release all of the packages

## 4.1.6

### Patch Changes

- aef7096: Fix failed release

## 4.1.5

### Patch Changes

- f7287ee: Bump to backstage@1.21.1

## 4.1.4

### Patch Changes

- 84e3119c: Bump `cross-fetch` to version "^4.0.0"

## 4.1.3

### Patch Changes

- 78617c07: Don't log the internal backend url.

## 4.1.2

### Patch Changes

- 9bfc49e1: Allow dry-run for HTTP methods that don't modify resources

## 4.1.1

### Patch Changes

- 87f90089: Version bump to Backstage 1.20.3

## 4.1.0

### Minor Changes

- 6f2ec523: Add flag that allows return of error responses as well as successful responses in templates so that the next step can run.

## 4.0.14

### Patch Changes

- 9bb000a6: Version bump to Backstage 1.19.6

## 4.0.13

### Patch Changes

- c6b0af08: Bump plugins version to backstage version 1.18.3

## 4.0.12

### Patch Changes

- 2fbcbee1: Bump to Backstage version 1.17.5

## 4.0.11

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

## 4.0.10

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 4.0.9

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 4.0.8

### Patch Changes

- 608e1061: Release all

## 4.0.7

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 4.0.6

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 4.0.5

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 4.0.4

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 4.0.3

### Patch Changes

- b1887781: Add option to disable request path logging.

## 4.0.2

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 4.0.1

### Patch Changes

- 1599cf96: release dependabot PRs

## 4.0.0

### Major Changes

- 04df8f6a: use discoveryApi for configuring the scaffolder-backend-module-http-request action

## 3.3.2

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 3.3.1

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 3.3.0

### Minor Changes

- 4df3165c: Allow posting string data via the `http:backstage:request` action.

## 3.2.2

### Patch Changes

- 279cf613: Fix incorrect action name in log line.

## 3.2.1

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 3.2.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 3.1.1

### Patch Changes

- eaa0bb2: update dependencies

## 3.1.0

### Minor Changes

- 9c7445e: If header authorization is specified in the input parameters, it is used instead of the backstage token

## 3.0.8

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 3.0.7

### Patch Changes

- c9cfaad: Release all plugins after fixing typescript exports issue.

## 3.0.6

### Patch Changes

- 86eca6a: Update dependencies

## 3.0.5

### Patch Changes

- 46c75ec: Hide the internal url from the log line in the scaffolder http action.

## 3.0.4

### Patch Changes

- 55c9711: update depdendencies

## 3.0.3

### Patch Changes

- 1d546fd: Adds type to method option for the http backstage request scaffolder action. This fixes the generated documentation.

## 3.0.2

### Patch Changes

- c60df50: added response body to log output in case an error occurred

## 3.0.1

### Patch Changes

- 6b4cc16: Update dependencies
  Add package information to the package.jsons, to tell the backstage cli how to run the tests

## 3.0.0

### Major Changes

- df841f0: Update dependecies to follow latest upstream version. Removed deprecated props of type 'Entity' passed into components as it is grabbed from context instead.

## 2.2.0

### Minor Changes

- f0421b4: Bumped to the latest upstream packages versions

## 2.1.10

### Patch Changes

- f5cd7e4: Update dependencies to latest Backstage packages

## 2.1.9

### Patch Changes

- 6eff3b1: Adds a timeout to the http request scaffolder actions
- 46b19a3: Update dependencies

## 2.1.8

### Patch Changes

- c779d9e: Update README.md to suggest v3 template
- c779d9e: Update dependencies

## 2.1.7

### Patch Changes

- 7da7bfe: Update dependencies
- 95c9c1b: Publish new scaffolder-backend-module-utils package

## 2.1.6

### Patch Changes

- b5db653: Update dependecies to latest packages

## 2.1.5

### Patch Changes

- a02dbf5: Migrating to TestApiProvider in the tests

## 2.1.4

### Patch Changes

- c55914a: Modify scaffolder template docs to highlight usage options.

## 2.1.3

### Patch Changes

- dd9bef9: Modify scaffolder plugin package.json and typescript configuration

## 2.1.2

### Patch Changes

- ce0846b: Modify folder definition in package.json to match expected. No functional changes.

## 2.1.0

### Minor Changes

- ed90f25: Breaking dependency updates for @backstage/core-app-api, @backstage/test-utils, @backstage/core-plugin-api, @backstage/backend-common && @backstage/integration

## 2.0.4

### Patch Changes

- 6923c16: Fix the typo in Readme file
