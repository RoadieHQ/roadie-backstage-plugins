# @roadiehq/backstage-plugin-security-insights

## 3.3.0

### Minor Changes

- c2274f9: Upgrade backstage version to `1.44.2`.

### Patch Changes

- Updated dependencies [c2274f9]
  - @roadiehq/github-auth-utils-react@1.2.0

## 3.2.0

### Minor Changes

- f215405: Upgrade to 1.40.2

### Patch Changes

- Updated dependencies [f215405]
  - @roadiehq/github-auth-utils-react@1.1.0

## 3.1.3

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.
- Updated dependencies [a83e7e9]
  - @roadiehq/github-auth-utils-react@1.0.2

## 3.1.2

### Patch Changes

- 0a4cf09: Update common auth lib

## 3.1.1

### Patch Changes

- Updated dependencies [1dd9384]
  - @roadiehq/github-auth-utils-react@1.0.0

## 3.1.0

### Minor Changes

- 5dba102: Create a shareable package to manage GitHub plugins auth state. This allows plugins using GitHub OAuth to use common functionality to show/hide components based on logged in scopes and urls

### Patch Changes

- Updated dependencies [5dba102]
  - @roadiehq/github-auth-utils-react@0.2.0

## 3.0.1

### Patch Changes

- 7cd4044: Modify login functionality to allow logging in using the Sign In button.

## 3.0.0

### Major Changes

- 6e4add9: BREAKING: Needs SCM auth API to be configured in the application.

  Migrate to use SCM auth instead of direct GitHub to allow possibility to work with multiple GitHub integrations at once.

  This will work automatically if `ScmAuth.createDefaultApiFactory()` is used when APIs registered. If not, you need to register an implementation of `scmAuthApiRef` as documented in: https://backstage.io/docs/auth/#custom-scmauthapi-implementation.

## 2.4.2

### Patch Changes

- ed8a7d6: chore: use luxon library insteaad of moment

## 2.4.1

### Patch Changes

- dc29b55: fix bug where security insights tab was empty on initial render until clicking one of the filter buttons

## 2.4.0

### Minor Changes

- 729a349: Add SignIn button to all Github related cards from entity overwiew page.

## 2.3.22

### Patch Changes

- 6847280: added keywords to all plugins

## 2.3.21

### Patch Changes

- 2718d81: Add link to Roadie in README

## 2.3.20

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata

## 2.3.19

### Patch Changes

- a4de843: Fix Dependabot Alerts non-open alerts when the table defaults to only show open alerts.

## 2.3.18

### Patch Changes

- eaba91f: Dependabot and Security Insights tabs now show open issues by default instead of all issues.

## 2.3.17

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5

## 2.3.16

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

## 2.3.15

### Patch Changes

- 23195a8: Version bump to backstage 1.23.3

## 2.3.14

### Patch Changes

- 6d5e4bf: Release all of the packages

## 2.3.13

### Patch Changes

- aef7096: Fix failed release

## 2.3.12

### Patch Changes

- f7287ee: Bump to backstage@1.21.1
- 84f7e01: Bump dependencies to match

## 2.3.11

### Patch Changes

- 87f90089: Version bump to Backstage 1.20.3

## 2.3.10

### Patch Changes

- 9bb000a6: Version bump to Backstage 1.19.6

## 2.3.9

### Patch Changes

- c6b0af08: Bump plugins version to backstage version 1.18.3

## 2.3.8

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

## 2.3.7

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 2.3.6

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 2.3.5

### Patch Changes

- 608e1061: Release all

## 2.3.4

### Patch Changes

- 77314913: Remove superfluous `Router` in `EntitySecurityInsightsContent` component. This fixes a bug where the Security Insights tab would not get rendered when a recent version of `react-router` is used.

## 2.3.3

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 2.3.2

### Patch Changes

- 0fe673e3: Version bumps

## 2.3.1

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 2.3.0

### Minor Changes

- 47ad5fd2: The Dependabot Alerts table now correctly displays and filters "Fixed" alerts.

## 2.2.1

### Patch Changes

- 012cf627: Fix issue where EntitySecurityInsightsCard and EntityDependabotAlertsCard were no longer exported.

## 2.2.0

### Minor Changes

- 89a75dca: Export `DependabotAlertsTable` and `SecurityInsightsTable` components allowing users to build custom integrations.

## 2.1.11

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 2.1.10

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 2.1.9

### Patch Changes

- 4fb9c5ef: docs: update deprecation notice with correct exported name

## 2.1.8

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 2.1.7

### Patch Changes

- 1599cf96: release dependabot PRs

## 2.1.6

### Patch Changes

- 3a870726: Bump the `msw` dependency to `^1.0.1`

## 2.1.5

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 2.1.4

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 2.1.3

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 2.1.2

### Patch Changes

- d4dfc5e5: Add additional contextual information on error messages for security components

## 2.1.1

### Patch Changes

- b295bde5: Fix `DependabotAlertsTable` to use the integration's base URL for fetches

## 2.1.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 2.0.10

### Patch Changes

- 073190b9: Update luxon to version 3.

## 2.0.9

### Patch Changes

- eaa0bb2: update dependencies

## 2.0.8

### Patch Changes

- 99153fe: Move react-router and react-router-dom dependencies to peerDependencies because of the migration to the stabel version of react-router in backstage/backstage. See the migration guide [here](https://backstage.io/docs/tutorials/react-router-stable-migration#for-plugin-authors)

## 2.0.7

### Patch Changes

- 62be7f3: Fix dependabot widget to only show open alerts.

## 2.0.6

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 2.0.5

### Patch Changes

- c9cfaad: Release all plugins after fixing typescript exports issue.

## 2.0.4

### Patch Changes

- a75d8c4: Fixes the `DependabotAlertsWidget` card to use the correct apiBaseUrl that is provided in the config.

## 2.0.3

### Patch Changes

- 86eca6a: Update dependencies

## 2.0.2

### Patch Changes

- 6b4cc16: Update dependencies
  Add package information to the package.jsons, to tell the backstage cli how to run the tests

## 2.0.1

### Patch Changes

- 1863e2a: Changed documentation to include entity switches

## 2.0.0

### Major Changes

- df841f0: Update dependecies to follow latest upstream version. Removed deprecated props of type 'Entity' passed into components as it is grabbed from context instead.

## 1.6.0

### Minor Changes

- f0421b4: Bumped to the latest upstream packages versions

## 1.5.12

### Patch Changes

- 5a2757c: Change notice headers to contain Larder Software Limited

## 1.5.11

### Patch Changes

- f5cd7e4: Update dependencies to latest Backstage packages

## 1.5.10

### Patch Changes

- 46b19a3: Update dependencies

## 1.5.9

### Patch Changes

- c779d9e: Update dependencies

## 1.5.8

### Patch Changes

- 7da7bfe: Update dependencies

## 1.5.7

### Patch Changes

- 5ae1b4b: Update README.md files

## 1.5.6

### Patch Changes

- b5db653: Update dependecies to latest packages

## 1.5.5

### Patch Changes

- a02dbf5: Migrating to TestApiProvider in the tests

## 1.5.4

### Patch Changes

- 142ce1c: Moved React dependencies to `peerDependencies` and allow both React v16 and v17 to be used.

## 1.5.3

### Patch Changes

- ecd06f5: Make "@backstage/core-app-api" a dev dependency

## 1.5.2

### Patch Changes

- 49abec7: Update patch to release new changes.

## 1.5.1

### Patch Changes

- a728fd1: Update underlying packages and release.

## 1.5.0

### Minor Changes

- ed90f25: Breaking dependency updates for @backstage/core-app-api, @backstage/test-utils, @backstage/core-plugin-api, @backstage/backend-common && @backstage/integration

## 1.4.3

### Patch Changes

- 6e63b92: Enable multiple GitHub integrations and extract source location from entity managed annotations backstage.io/managed-by-origin-location or backstage.io/managed-by-location.

## 1.4.2

### Patch Changes

- 4d426f9: Updated dependencies to follow latest Backstage release

## 1.4.1

### Patch Changes

- 3f280ef: Updated 'msw' package version in order to correctly run tests.
