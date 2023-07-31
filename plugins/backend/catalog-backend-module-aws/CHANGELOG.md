# @backstage/plugin-catalog-backend-module-aws

## 1.3.13

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 1.3.12

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 1.3.11

### Patch Changes

- 608e1061: Release all

## 1.3.10

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 1.3.9

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 1.3.8

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 1.3.7

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 1.3.6

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 1.3.5

### Patch Changes

- 1599cf96: release dependabot PRs

## 1.3.4

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 1.3.3

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 1.3.2

### Patch Changes

- bc1c983f: Minor change to import for `link2aws`.

## 1.3.1

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 1.3.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 1.2.7

### Patch Changes

- eaa0bb2: update dependencies

## 1.2.6

### Patch Changes

- 0ba26af: Update dependencies

## 1.2.5

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 1.2.4

### Patch Changes

- c9cfaad: Release all plugins after fixing typescript exports issue.

## 1.2.3

### Patch Changes

- 86eca6a: Update dependencies

## 1.2.2

### Patch Changes

- 406c702: Use a sha256 of the arn for the aws resource names.

## 1.2.1

### Patch Changes

- 938430c: Add EKS Cluster Resource provider to the aws catalog backend plugin.

## 1.2.0

### Minor Changes

- 8045ca3: Adds a new iam role provider for the aws entity providers.

## 1.1.1

### Patch Changes

- 55c9711: update depdendencies

## 1.1.0

### Minor Changes

- dcad3c6: Add implementations for providers to handle DynamoDB tables and DynamoDB table row data.

## 1.0.0

### Major Changes

- 40997a1: bump @backstage packages to 1.0.x version

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
