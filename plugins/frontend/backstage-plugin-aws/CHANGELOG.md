# @roadiehq/backstage-plugin-aws

## 0.0.2

### Patch Changes

- e2a86ee: Adds initial versions of @roadiehq/catalog-backend-module-aws, @roadiehq/backstage-plugin-aws and @roadiehq/backstage-plugin-aws-backend.

  @roadiehq/catalog-backend-module-aws exposes entity provider classes to injest S3 Buckets, Lambda Functions and IAM users into the entity catalog.

  @roadiehq/backstage-plugin-aws-backend provides a generic API to retrieve AWS resources using the CloudControl API.

  @roadiehq/backstage-plugin-aws provides entity component cards to display details about S3 Buckets, Lambda Functions and IAM users.

- e1e99d9: Use a consistent version dependency of aws-sdk across the repository.
