---
'@roadiehq/catalog-backend-module-aws': major
---

Modify configuration shapes to conform to AWS provided Backstage integration configuration. Start using the official credentials provider for AWS resources.
BREAKING: Config shape has been modified to match official integration config. Change `roleArn` to `roleName`.
