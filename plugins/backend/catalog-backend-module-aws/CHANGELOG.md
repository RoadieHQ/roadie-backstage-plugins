# @backstage/plugin-catalog-backend-module-aws

## 5.10.0

### Minor Changes

- c2274f9: Upgrade backstage version to `1.44.2`.

## 5.9.0

### Minor Changes

- 079596d: Use default annotations for entity in the S3 bucket entity provider.

## 5.8.3

### Patch Changes

- a1075c2: Add count of entities for IAM and RDS providers.

## 5.8.2

### Patch Changes

- c3a96f6: Add default annotations to the eks cluster resource.

## 5.8.1

### Patch Changes

- 6b542e1: Fix how the openseach domain template variable is provided.

## 5.8.0

### Minor Changes

- f215405: Upgrade to 1.40.2
- b0f3d28: Adds ability to template entity from AWS entity providers.

## 5.7.1

### Patch Changes

- faf20d0: Remove deprecated `@backstage/backend-common` package.

## 5.7.0

### Minor Changes

- ce66df6: Add 5 more resources to the AWS entity provider. Include VPCs, subnets, EBS volumes, Load Balancers and security groups

## 5.6.0

### Minor Changes

- eb1a3b7: Add AWSECRRepositoryEntityProvider to ingest aws ecr repos

## 5.5.1

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.

## 5.5.0

### Minor Changes

- 1a18001: Add tag mapping for SNS Resource Provider

## 5.4.4

### Patch Changes

- e91c9e4: Add test, debug logging and RDS support for ownerTag mapping

## 5.4.3

### Patch Changes

- 8fdf8c1: Use region from config in dynamo table provider

## 5.4.2

### Patch Changes

- 7a10368: Add more providers to allow custom label mapping

## 5.4.1

### Patch Changes

- 30883b0: Allow custom label mapping for new AWS providers

## 5.4.0

### Minor Changes

- 4bf2752: Add SQS, Redis and OpenSearch providers

## 5.3.1

### Patch Changes

- 5417267: Add support from namespaced group tagging

## 5.3.0

### Minor Changes

- 8915f83: We are making the logger compatible with Backstage's LoggerService and winston's Logger so that Roadie can be used with newer and older versions of Backstage.

## 5.2.0

### Minor Changes

- ac7b6e7: Implement AWS SNS Topic provider

## 5.1.0

### Minor Changes

- 31e16dd: Add additional annotations. Add ingerators to decide resource type def

## 5.0.4

### Patch Changes

- 6847280: added keywords to all plugins

## 5.0.3

### Patch Changes

- 2718d81: Add link to Roadie in README

## 5.0.2

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata

## 5.0.1

### Patch Changes

- 0d76d15: Handle cases where S3 buckets don't have a tag set.

## 5.0.0

### Major Changes

- 05a7dd4: Modify AWS providers to allow fully runtime customizable dynamic run configuration. Change provider naming convention, remove existing region argument.

## 4.2.0

### Minor Changes

- 47a2893: Add the possibility to define region on runtime when running the provider

## 4.1.7

### Patch Changes

- 4c9de97: Allow label values to be mapped in a custom way.

## 4.1.6

### Patch Changes

- bbe1d67: Add more sanitization to AWS tags to labels functionality

## 4.1.5

### Patch Changes

- ace4e5a: Add label value/key sanitization to remove trailing unsupported characters.

## 4.1.4

### Patch Changes

- 715a847: Use region only when available.

## 4.1.3

### Patch Changes

- c3d4096: Add region config to STS client

## 4.1.2

### Patch Changes

- cf05e8a: Add temporary credentials option to annotations retrieval also.

## 4.1.1

### Patch Changes

- 3b56b9c: Label values are sanitized a bit better.

## 4.1.0

### Minor Changes

- be22bad: Allow explicit temporary credentials construction for AWS entity providers to enable custom role assumption functionality.

## 4.0.2

### Patch Changes

- 6017323: Export sdk credentials provider from the credentials chain.

## 4.0.1

### Patch Changes

- dfeea32: Modify credentials loading to conform to expecting config object shape

## 4.0.0

### Major Changes

- 22c68fe: Modify configuration shapes to conform to AWS provided Backstage integration configuration. Start using the official credentials provider for AWS resources.
  BREAKING: Config shape has been modified to match official integration config. Change `roleArn` to `roleName`.

## 3.1.0

### Minor Changes

- 3b7cf6c: Add possibility to define entity relationships by using AWS Tags when providing Resource entities directly from AWS. Expose `system`, `domain`, `dependencyOf` and `dependsOn` tag keys to be used.

## 3.0.1

### Patch Changes

- d52a384: Use role region for sts client.

## 3.0.0

### Major Changes

- 855af40: fix AWSOrganizationAccountsProvider

## 2.5.0

### Minor Changes

- b629dcf: Enable group entity matching for owner decoration from existing groups

## 2.4.0

### Minor Changes

- b682159: Changes owner tag mapping to be case insensitive

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5

## 2.3.0

### Minor Changes

- 1754d12: Add possibility for AWS Providers to identify resource owners by using tags in AWS.

### Patch Changes

- 85bfaee: Allow fully qualified owner names

## 2.2.1

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

## 2.2.0

### Minor Changes

- 5a09b51: Add new AWS Organization Accounts provider.

## 2.1.6

### Patch Changes

- f2e39a0: Backstage version bump to 1.23.4

## 2.1.5

### Patch Changes

- 23195a8: Version bump to backstage 1.23.3

## 2.1.4

### Patch Changes

- 6d5e4bf: Release all of the packages

## 2.1.3

### Patch Changes

- aef7096: Fix failed release

## 2.1.2

### Patch Changes

- f7287ee: Bump to backstage@1.21.1

## 2.1.1

### Patch Changes

- 04df9795: Use deterministic provider names for location entry when creating entities to enable garbage collection possibility.

## 2.1.0

### Minor Changes

- a7f8d4d8: Add AWS RDS entity provider.

## 2.0.1

### Patch Changes

- 1c02b489: Add uniqueness to AWS providers to allow multiple configuration if wanted.

## 2.0.0

### Major Changes

- f087aeb9: Breaking change on entity output level, no code changes needed for most use cases.

  Updating entities provided by DDB and Lambda providers to be of kind Resource instead of a Component.

  Adding an additional EntityProvider to create entities from EC2 instances.

## 1.3.18

### Patch Changes

- 87f90089: Version bump to Backstage 1.20.3

## 1.3.17

### Patch Changes

- 9bb000a6: Version bump to Backstage 1.19.6

## 1.3.16

### Patch Changes

- c6b0af08: Bump plugins version to backstage version 1.18.3

## 1.3.15

### Patch Changes

- 2fbcbee1: Bump to Backstage version 1.17.5

## 1.3.14

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

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
