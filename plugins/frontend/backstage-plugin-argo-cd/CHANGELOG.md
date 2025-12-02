# @roadiehq/backstage-plugin-argo-cd

## 2.12.1

### Patch Changes

- 374eef1: Fix: Display repository URL and path for ArgoCD applications with multiple sources

  When ArgoCD applications use multiple sources via `spec.sources` array instead of `spec.source`, the DetailsDrawer component was unable to display source and path information. This fix adds a fallback to extract these values from the first source in the array when the singular source property is not available.

  **Changes:**

  - Updated `DetailsDrawer.tsx` to check `spec.source?.repoURL` first, then fallback to `spec.sources?.[0]?.repoURL`
  - Updated `DetailsDrawer.tsx` to check `spec.source?.path` first, then fallback to `spec.sources?.[0]?.path`

  This change is backwards compatible with single-source applications.

  **Related:** Similar fix was applied to the history card in PR #2025

## 2.12.0

### Minor Changes

- c2274f9: Upgrade backstage version to `1.44.2`.

## 2.11.0

### Minor Changes

- 87f697c: Added support for ArgoCD applications that use multiple sources (by using the first)

## 2.10.0

### Minor Changes

- f215405: Upgrade to 1.40.2

## 2.9.1

### Patch Changes

- c56e0b2: Fixing crashing when using the `argocd` plugin with the new frontend system. The wrong Blueprint type was used, as this should be a tab used within context of an Entity.

## 2.9.0

### Minor Changes

- 98f83e4: Provide title & subtitle option for the EntityArgoCDOverviewCard

## 2.8.7

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.

## 2.8.6

### Patch Changes

- ed8a7d6: chore: use luxon library insteaad of moment

## 2.8.5

### Patch Changes

- 7520be9: update linkUrl logic in ArgoCDHistory component for multi-instance support

## 2.8.4

### Patch Changes

- 6847280: added keywords to all plugins

## 2.8.3

### Patch Changes

- 2718d81: Add link to Roadie in README

## 2.8.2

### Patch Changes

- 741af3b: fix: Align pluginId metadata to id set during plugin initialization

## 2.8.1

### Patch Changes

- 1e83f94: Modify linking functionality construction to construct the link

## 2.8.0

### Minor Changes

- dc9664d: Allow setting up a separate frontend URL on multiple Ar instances for linking purposes.

## 2.7.0

### Minor Changes

- 971f076: Adds support for Backstage's new frontend system, available via the `/alpha` sub-path export.

## 2.6.7

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata

## 2.6.6

### Patch Changes

- e816d1e: Adding the terminateOperation flag to the /sync endpoint. It is an optional boolean flag that can be set to true and it will terminate the previous Sync in progress before starting a new sync. This is a non-breaking change because if the flag is not provided and set to true the existing logic will not be impacted.

## 2.6.5

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5

## 2.6.4

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

## 2.6.3

### Patch Changes

- 8868363: Fixes an issue where the ArgoCD details card would error if any of the items returned by ArgoCD are missing the status.operationState field

## 2.6.2

### Patch Changes

- 92ad85a: Export ARGOCD*ANNOTATION*\* constants from the plugin.

## 2.6.1

### Patch Changes

- 23195a8: Version bump to backstage 1.23.3

## 2.6.0

### Minor Changes

- e810239: Added pagination and sorting for contents of ArgoCDDetailsCard which improves readability of the component

## 2.5.4

### Patch Changes

- 6d5e4bf: Release all of the packages

## 2.5.3

### Patch Changes

- aef7096: Fix failed release

## 2.5.2

### Patch Changes

- f7287ee: Bump to backstage@1.21.1

## 2.5.1

### Patch Changes

- 52a1b6b3: Fix issue where query params were stripped when not using namespaced apps

## 2.5.0

### Minor Changes

- 24eac291: Lazy load revisions and allow admins to limit the numbers of revisions to load in the configuration

## 2.4.1

### Patch Changes

- 87f90089: Version bump to Backstage 1.20.3

## 2.4.0

### Minor Changes

- 32866432: Adds support for Applications in any namespace (as per https://argo-cd.readthedocs.io/en/stable/operator-manual/app-any-namespace/)

## 2.3.6

### Patch Changes

- 9bb000a6: Version bump to Backstage 1.19.6

## 2.3.5

### Patch Changes

- 6a8eb8c4: added sorting and pagination to argocd history

## 2.3.4

### Patch Changes

- c6b0af08: Bump plugins version to backstage version 1.18.3

## 2.3.3

### Patch Changes

- 1cb56767: fix: return item when no history

## 2.3.2

### Patch Changes

- 99534e20: Fix undefined error.

## 2.3.1

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

## 2.3.0

### Minor Changes

- 51412379: Fix #796, use authentication api when calling service locator

## 2.2.20

### Patch Changes

- 2c2661cb: Filtered null values from ArgoCD revision history

## 2.2.19

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 2.2.18

### Patch Changes

- 48439673: Fix for cases where argo application history source is Helm, which would cause revision metadata api to return 500
- 0e4c6da4: Use ErrorBoundary from @backstage/core-components

## 2.2.17

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 2.2.16

### Patch Changes

- 608e1061: Release all

## 2.2.15

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 2.2.14

### Patch Changes

- 9dc30073: Expose instances for the frontend to display ArgoCD dashboard links in a multi instance setup.
  Additionally, don't expose secrets.

## 2.2.13

### Patch Changes

- b2ef20b1: The instance url for the argocd backend plugin will be used if `argocd.baseUrl` is not defined.

## 2.2.12

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 2.2.11

### Patch Changes

- 8ae4bbc7: ---

  '@roadiehq/backstage-plugin-argo-cd-backend': patch
  '@roadiehq/backstage-plugin-argo-cd': patch

  ***

  Added API to fetch revision information.
  Modified Argocd overview card to show error message. When there is error message, users can hover the field in the overview table to see the error message. Modified the Argocd history card to show more informations including author, message, and combine deploy detail in one column.

## 2.2.10

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 2.2.9

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 2.2.8

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 2.2.7

### Patch Changes

- 1599cf96: release dependabot PRs

## 2.2.6

### Patch Changes

- 3a870726: Bump the `msw` dependency to `^1.0.1`

## 2.2.5

### Patch Changes

- b619d5d8: make `getBaseUrl` and `fetchDecode` methods public so that they can be used when the plugin is subclassed

## 2.2.4

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 2.2.3

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 2.2.2

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 2.2.1

### Patch Changes

- b7a7536a: Fix circular dependencies.

## 2.2.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 2.1.10

### Patch Changes

- 6daac9bc: Encoded all usage of app names and selectors

## 2.1.9

### Patch Changes

- eaa0bb2: update dependencies

## 2.1.8

### Patch Changes

- 99153fe: Move react-router and react-router-dom dependencies to peerDependencies because of the migration to the stabel version of react-router in backstage/backstage. See the migration guide [here](https://backstage.io/docs/tutorials/react-router-stable-migration#for-plugin-authors)

## 2.1.7

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 2.1.6

### Patch Changes

- c9cfaad: Release all plugins after fixing typescript exports issue.

## 2.1.5

### Patch Changes

- 86eca6a: Update dependencies

## 2.1.4

### Patch Changes

- e92dc3b: properly escaped app selectors

## 2.1.3

### Patch Changes

- 9db0101: Hide instance column in argo cards when using a single argo instance

## 2.1.2

### Patch Changes

- 6b4cc16: Update dependencies
  Add package information to the package.jsons, to tell the backstage cli how to run the tests

## 2.1.1

### Patch Changes

- ae873be: Fix Argo CD Dashboard button

## 2.1.0

### Minor Changes

- 0af1e28: add additional information from argo cd in a drawer component

## 2.0.0

### Major Changes

- df841f0: Update dependecies to follow latest upstream version. Removed deprecated props of type 'Entity' passed into components as it is grabbed from context instead.

## 1.6.0

### Minor Changes

- f0421b4: Bumped to the latest upstream packages versions

## 1.5.14

### Patch Changes

- 5a2757c: Change notice headers to contain Larder Software Limited

## 1.5.13

### Patch Changes

- f5cd7e4: Update dependencies to latest Backstage packages

## 1.5.12

### Patch Changes

- 46b19a3: Update dependencies

## 1.5.11

### Patch Changes

- c779d9e: Update dependencies

## 1.5.10

### Patch Changes

- 7da7bfe: Update dependencies

## 1.5.9

### Patch Changes

- f79f2a7: Gracefully handle situation where an app is missing operationState

## 1.5.8

### Patch Changes

- 5ae1b4b: Update README.md files

## 1.5.7

### Patch Changes

- b5db653: Update dependecies to latest packages

## 1.5.6

### Patch Changes

- a02dbf5: Migrating to TestApiProvider in the tests

## 1.5.5

### Patch Changes

- 142ce1c: Moved React dependencies to `peerDependencies` and allow both React v16 and v17 to be used.

## 1.5.4

### Patch Changes

- ecd06f5: Make "@backstage/core-app-api" a dev dependency

## 1.5.3

### Patch Changes

- b69543e: Fix bug where an instance with no items would crash the card

## 1.5.2

### Patch Changes

- 49abec7: Update patch to release new changes.

## 1.5.1

### Patch Changes

- a728fd1: Update underlying packages and release.

## 1.5.0

### Minor Changes

- ed90f25: Breaking dependency updates for @backstage/core-app-api, @backstage/test-utils, @backstage/core-plugin-api, @backstage/backend-common && @backstage/integration

## 1.4.0

### Minor Changes

- 1d256c6: Support multiple Argo instances using the app-selector annotation

## 1.3.3

### Patch Changes

- 120ca2e: Removed deprecated `description` option from `ApiRefConfig` for all plugins

## 1.3.2

### Patch Changes

- 4d426f9: Updated dependencies to follow latest Backstage release

## 1.3.1

### Patch Changes

- 3f280ef: Updated 'msw' package version in order to correctly run tests.
