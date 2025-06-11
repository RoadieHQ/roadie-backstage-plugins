# @roadiehq/backstage-plugin-aws-backend

## 1.3.2

### Patch Changes

- 296cca7: Remove deprecated `@backstage/backend-common` from dependencies.

## 1.3.1

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.

## 1.3.0

### Minor Changes

- 8915f83: We are making the logger compatible with Backstage's LoggerService and winston's Logger so that Roadie can be used with newer and older versions of Backstage.

## 1.2.0

### Minor Changes

- ac7b6e7: Implement AWS SNS Topic provider

## 1.1.26

### Patch Changes

- 6847280: added keywords to all plugins

## 1.1.25

### Patch Changes

- 2718d81: Add link to Roadie in README

## 1.1.24

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata

## 1.1.23

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5

## 1.1.22

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

## 1.1.21

### Patch Changes

- f2e39a0: Backstage version bump to 1.23.4

## 1.1.20

### Patch Changes

- 23195a8: Version bump to backstage 1.23.3

## 1.1.19

### Patch Changes

- 6d5e4bf: Release all of the packages

## 1.1.18

### Patch Changes

- aef7096: Fix failed release

## 1.1.17

### Patch Changes

- f7287ee: Bump to backstage@1.21.1

## 1.1.16

### Patch Changes

- 87f90089: Version bump to Backstage 1.20.3

## 1.1.15

### Patch Changes

- 9bb000a6: Version bump to Backstage 1.19.6

## 1.1.14

### Patch Changes

- c6b0af08: Bump plugins version to backstage version 1.18.3

## 1.1.13

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

## 1.1.12

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 1.1.11

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 1.1.10

### Patch Changes

- 608e1061: Release all

## 1.1.9

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 1.1.8

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 1.1.7

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 1.1.6

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 1.1.5

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 1.1.4

### Patch Changes

- 1599cf96: release dependabot PRs

## 1.1.3

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 1.1.2

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 1.1.1

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 1.1.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 1.0.5

### Patch Changes

- eaa0bb2: update dependencies

## 1.0.4

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 1.0.3

### Patch Changes

- c9cfaad: Release all plugins after fixing typescript exports issue.

## 1.0.2

### Patch Changes

- 86eca6a: Update dependencies

## 1.0.1

### Patch Changes

- 55c9711: update depdendencies

## 1.0.0

### Major Changes

- 40997a1: initial release of the plugin

### Patch Changes

- 6b4cc16: Update dependencies
  Add package information to the package.jsons, to tell the backstage cli how to run the tests

## 0.0.3

### Patch Changes

- e2a86ee: Adds initial versions of @roadiehq/catalog-backend-module-aws, @roadiehq/backstage-plugin-aws and @roadiehq/backstage-plugin-aws-backend.

  @roadiehq/catalog-backend-module-aws exposes entity provider classes to injest S3 Buckets, Lambda Functions and IAM users into the entity catalog.

  @roadiehq/backstage-plugin-aws-backend provides a generic API to retrieve AWS resources using the CloudControl API.

  @roadiehq/backstage-plugin-aws provides entity component cards to display details about S3 Buckets, Lambda Functions and IAM users.

- e1e99d9: Use a consistent version dependency of aws-sdk across the repository.
