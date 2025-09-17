# @roadiehq/catalog-backend-module-okta

## 1.2.2

### Patch Changes

- eab471e: Updated the `backstage.pluginId` to match the `pluginId` set in the `createBackendModule`

## 1.2.1

### Patch Changes

- 4c8ae83: Fixes the publish config to release an actual version

## 1.2.0

### Minor Changes

- f215405: Upgrade to 1.40.2

## 1.1.4

### Patch Changes

- 296cca7: Remove deprecated `@backstage/backend-common` from dependencies.

## 1.1.3

### Patch Changes

- eb31089: Add new user naming strategy `slugify`. This will allow to use the whole username as a user entity. jhon.doe@example.com -> jhon.doe-example.com

## 1.1.2

### Patch Changes

- 98ff2bf: Apply chunking of membership resolution to OktaGroupEntityProvider

## 1.1.1

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.

## 1.1.0

### Minor Changes

- 7d8ea53: export EntityTransformer types, including example factory usage

## 1.0.3

### Patch Changes

- d6c256f: Update README.md

## 1.0.2

### Patch Changes

- 6847280: added keywords to all plugins

## 1.0.1

### Patch Changes

- 2718d81: Add link to Roadie in README

## 1.0.0

### Major Changes

- 46b3142: Upgrade the catalog module to the backend system.

  BREAKING:

  - Interfaces have been updated to favour backend system configurations over legacy system ones.
  - Original provider factory interface has been changed to accept only okta configurations.
  - Configuration has been modified to contain schedules

  Adds default configurations for the provider that can be added in. Leaves a customizable module construction option so more use cases can be covered.

## 0.10.2

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata

## 0.10.1

### Patch Changes

- 370905e: Improved logging of the orgEntityProvider

## 0.10.0

### Minor Changes

- adad369: Add alpha export point which exposes the necessary module for the new backend system

## 0.9.13

### Patch Changes

- 5376bd5: Remove `crypto-js` unused dependency.
- d02d5df: Upgrade to backstage 1.26.5

## 0.9.12

### Patch Changes

- 4bfd622: Hide oauth credendtials and token from config api and log outputs

## 0.9.11

### Patch Changes

- 69523e2: Do not expose Okta secrets in frontend.

## 0.9.10

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

## 0.9.9

### Patch Changes

- f2e39a0: Backstage version bump to 1.23.4

## 0.9.8

### Patch Changes

- 3c82d29: Allow configuration to chunk the number of group membership requests to the Okta API.

## 0.9.7

### Patch Changes

- 23195a8: Version bump to backstage 1.23.3

## 0.9.6

### Patch Changes

- 6d5e4bf: Release all of the packages

## 0.9.5

### Patch Changes

- aef7096: Fix failed release

## 0.9.4

### Patch Changes

- f7287ee: Bump to backstage@1.21.1

## 0.9.3

### Patch Changes

- 87f90089: Version bump to Backstage 1.20.3

## 0.9.2

### Patch Changes

- 9bb000a6: Version bump to Backstage 1.19.6

## 0.9.1

### Patch Changes

- c6b0af08: Bump plugins version to backstage version 1.18.3

## 0.9.0

### Minor Changes

- cfc712b7: Adds option to provide custom user transformer for user and org providers

## 0.8.7

### Patch Changes

- 2fbcbee1: Bump to Backstage version 1.17.5
- 42574014: Added the `profile-name` `GroupNamingStrategy`. This strategy names Group entities exactly as their group profile name. ⚠ The Okta field supports characters not supported as [entity names in backstage](https://backstage.io/docs/features/software-catalog/descriptor-format#name-required). ⚠

## 0.8.6

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

## 0.8.5

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 0.8.4

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 0.8.3

### Patch Changes

- 608e1061: Release all

## 0.8.2

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 0.8.1

### Patch Changes

- 215dc186: Improve `README.md` to handle empty config in example.

## 0.8.0

### Minor Changes

- ad0e4458: Adds capacity to parse specific profile attributes into annotations

## 0.7.5

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 0.7.4

### Patch Changes

- 8784b5f5: Refactor and add tests to okta group tree.

## 0.7.3

### Patch Changes

- b55aca8d: Add debug logging to the okta tree pruning.

## 0.7.2

### Patch Changes

- 365f12df: Adding a log line to indicate that empty groups will be pruned.

## 0.7.1

### Patch Changes

- 5319e868: No longer raise error when an non error like object is thrown.

## 0.7.0

### Minor Changes

- 46cc9fc7: Add smarter pruning of empty groups. Previously, parent groups of groups with members were being pruned. This change includes parent groups if their decendants have members.

## 0.6.1

### Patch Changes

- 7c561d79: Uses imports from the `@backstage/plugin-catalog-node` package

## 0.6.0

### Minor Changes

- 7baa7791: Rewrite the configuration and logic for creating a hierarchy of groups. Now it does not insist on the group name matching the parent key.

## 0.5.7

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 0.5.6

### Patch Changes

- cc0f1489: Allow the okta provider to include groups that have no members.

## 0.5.5

### Patch Changes

- 3cca5a13: Only set the parent entity name if it is provided.

## 0.5.4

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 0.5.3

### Patch Changes

- cf15f404: Support number as parent org id.

## 0.5.2

### Patch Changes

- fbbfd60c: Allow supporting profile name fields that are numbers.

## 0.5.1

### Patch Changes

- 03db4933: Fix case where the parent group field is empty.

## 0.5.0

### Minor Changes

- 7992ceb8: Add ability to configure a custom group/user names, and provide the name of the parent group to create a hierarchy of groups.

## 0.4.8

### Patch Changes

- ce51ed14: Fix example okta oauth configuration to use regular yaml
- ac5717e6: Update plugins to Backstage version 1.11.1

## 0.4.7

### Patch Changes

- 58506f09: Enabled the use of OAuth credentials for authenticating to okta. This allows credential to be provisiond that have the minimum required level of privilege for the provider to function.
- 1599cf96: release dependabot PRs

## 0.4.6

### Patch Changes

- db03675e: Fixed typo in README

## 0.4.5

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 0.4.4

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 0.4.3

### Patch Changes

- a77f47f2: Emit an info-level log upon completion of Okta provider execution in addition to start of execution.

## 0.4.2

### Patch Changes

- 067afec4: Use environment variable substitution in docs example.

## 0.4.1

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 0.4.0

### Minor Changes

- 1164f19b: Add ability to filter okta user and group data.

## 0.3.1

### Patch Changes

- 36e302cc: Fixed bug in OktaGroupEntityProvider when OKTA response returns a null description field.

## 0.3.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 0.2.7

### Patch Changes

- 433291fb: Changed OktaUserEntityProvider to propogate the Okta displayName field into the Backstage displayName field (instead of email).

## 0.2.6

### Patch Changes

- eaa0bb2: update dependencies

## 0.2.5

### Patch Changes

- 0ba26af: Update dependencies

## 0.2.4

### Patch Changes

- 8e003da: Fix readme

## 0.2.3

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 0.2.2

### Patch Changes

- 3c7303c: Allow using naming strategy for group -> user association.

## 0.2.1

### Patch Changes

- 9539caf: Release plugin to trigger rebuild of package.

## 0.2.0

### Minor Changes

- fa68b10: Allow various strategies for naming the resulting entities for the Okta entity providers.

## 0.1.0

### Minor Changes

- 6c73c72: Adds entity providers for okta groups and users.
