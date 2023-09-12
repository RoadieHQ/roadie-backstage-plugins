# @roadiehq/backstage-plugin-argo-cd-backend

## 2.11.2

### Patch Changes

- 56c40ed5: fix bug that throws error when some argo instances are unavailable

## 2.11.1

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

## 2.11.0

### Minor Changes

- 0c7d7136: Updates the error thrown in argoCreateApplication to include the error message from argo api response.

## 2.10.0

### Minor Changes

- d52d82ec: Add endpoint that grabs all argo projects and another endpoint that checks if app already exists in a given cluster with the same repo and source

## 2.9.0

### Minor Changes

- 23ca55f3: Adding FailOnSharedResource=true to syncOptions when an argo app is created to prevent dueling argo applications

## 2.8.2

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 2.8.1

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 2.8.0

### Minor Changes

- 18f8a82f: add updateArgoApp endpoint to change source repo, path, and label values

## 2.7.8

### Patch Changes

- 608e1061: Release all

## 2.7.7

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 2.7.6

### Patch Changes

- 9dc30073: Expose instances for the frontend to display ArgoCD dashboard links in a multi instance setup.
  Additionally, don't expose secrets.

## 2.7.5

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 2.7.4

### Patch Changes

- 8ae4bbc7: ---

  '@roadiehq/backstage-plugin-argo-cd-backend': patch
  '@roadiehq/backstage-plugin-argo-cd': patch

  ***

  Added API to fetch revision information.
  Modified Argocd overview card to show error message. When there is error message, users can hover the field in the overview table to see the error message. Modified the Argocd history card to show more informations including author, message, and combine deploy detail in one column.

## 2.7.3

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 2.7.2

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 2.7.1

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 2.7.0

### Minor Changes

- dbaf0f83: enhance argo delete operation to handle failures better

### Patch Changes

- 1599cf96: release dependabot PRs

## 2.6.4

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 2.6.3

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 2.6.2

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 2.6.1

### Patch Changes

- 15af4518: Fixed using selectors to find Application across multiple ArgoCD servers

## 2.6.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 2.5.3

### Patch Changes

- eaa0bb2: update dependencies

## 2.5.2

### Patch Changes

- 231f37e: Added logging to improve visibility

## 2.5.1

### Patch Changes

- e017302: 1. Get Application App Data has a changed thrown error message. 2. Failing on a wider spectrum of error messages when deleting projects. If you were expecting a false when the project failed to delete for these other possible reasons, now the function will throw for those other possible reasons. 3. Logging thrown errors for the endpoints that create an argo configuration, or delete an argo configuration. 4. Added unit tests.

## 2.5.0

### Minor Changes

- 8716dfb: Use different credentials for each instance

## 2.4.4

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 2.4.3

### Patch Changes

- c9cfaad: Release all plugins after fixing typescript exports issue.

## 2.4.2

### Patch Changes

- 86eca6a: Update dependencies

## 2.4.1

### Patch Changes

- 55c9711: update depdendencies

## 2.4.0

### Minor Changes

- 16d70f0: Use `cross-fetch` instead of `axios` for rest requests.

## 2.3.0

### Minor Changes

- 9bcaa85: bug fix: read label value being passed in instead of using app name

## 2.2.0

### Minor Changes

- 4259734: fix: argocd sync wasn't being sent as an object but rather a string

## 2.1.1

### Patch Changes

- 6b4cc16: Update dependencies
  Add package information to the package.jsons, to tell the backstage cli how to run the tests

## 2.1.0

### Minor Changes

- 3ba9cb9: - Add create endpoints
  - Add delete endpoints
  - Add sync endpoints
  - Add scaffolder action for create

## 2.0.0

### Major Changes

- df841f0: Update dependecies to follow latest upstream version. Removed deprecated props of type 'Entity' passed into components as it is grabbed from context instead.

## 1.3.0

### Minor Changes

- f0421b4: Bumped to the latest upstream packages versions

## 1.2.10

### Patch Changes

- f5cd7e4: Update dependencies to latest Backstage packages

## 1.2.9

### Patch Changes

- 46b19a3: Update dependencies

## 1.2.8

### Patch Changes

- c779d9e: Update dependencies

## 1.2.7

### Patch Changes

- 7da7bfe: Update dependencies

## 1.2.6

### Patch Changes

- ee81868: Update dependencies

## 1.2.5

### Patch Changes

- 5ae1b4b: Update README.md files

## 1.2.4

### Patch Changes

- b5db653: Update dependecies to latest packages

## 1.2.3

### Patch Changes

- a02dbf5: Migrating to TestApiProvider in the tests

## 1.2.2

### Patch Changes

- 49abec7: Update patch to release new changes.

## 1.2.1

### Patch Changes

- a728fd1: Update underlying packages and release.

## 1.2.0

### Minor Changes

- ed90f25: Breaking dependency updates for @backstage/core-app-api, @backstage/test-utils, @backstage/core-plugin-api, @backstage/backend-common && @backstage/integration

## 1.1.1

### Patch Changes

- 773692a: Change default port of backend from 7000 to 7007.

  This is due to the AirPlay Receiver process occupying port 7000 and preventing local Backstage instances on MacOS to start.

## 1.1.0

### Minor Changes

- 1d256c6: Support multiple Argo instances using the app-selector annotation
