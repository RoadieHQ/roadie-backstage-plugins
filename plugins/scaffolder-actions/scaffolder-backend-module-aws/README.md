# scaffolder-backend-module-utils actions package

Welcome to the roadie `aws` actions for the `scaffolder-backend`.

This contains a collection of actions:

- `roadiehq:aws:s3:cp`

## Getting started

Create your Backstage application using the Backstage CLI as described here:
https://backstage.io/docs/getting-started/create-an-app

> Note: If you are using this plugin in a Backstage monorepo that contains the code for `@backstage/plugin-scaffolder-backend`, you need to modify your internal build processes to transpile files from the `node_modules` folder as well.

You need to configure the action in your backend:

## From your Backstage root directory

```
cd packages/backend
yarn add @roadiehq/scaffolder-backend-module-aws
```

Configure the action:
(you can check the [docs](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) to see all options):

Here you can pick the actions that you'd like to register to your backstage instance.

```typescript
// packages/backend/src/plugins/scaffolder.ts
import { createAwsS3CpAction } from '@roadiehq/scaffolder-backend-module-aws';
...

const actions = [
  createAwsS3CpAction(),
  ...createBuiltinActions({
    containerRunner,
    integrations,
    config,
    catalogClient,
    reader,
  }),
];

return await createRouter({
  containerRunner,
  logger,
  config,
  database,
  catalogClient,
  reader,
  actions,
});
```

# Authentication

This action accepts an optional `credentials` paramter. Which should be a `Credentials | CredentialProvider` Interface. If you want to override the `@aws-sdk/client-s3` module's default authentication provide a valid credential to the action.

```typescript
// packages/backend/src/plugins/scaffolder.ts
import { createAwsS3CpAction } from '@roadiehq/scaffolder-backend-module-aws';
import { fromIni } from "@aws-sdk/credential-provider";
...

const actions = [
  createAwsS3CpAction({credentials: fromIni({profile: "dev" })}),
  ...createBuiltinActions({
    containerRunner,
    integrations,
    config,
    catalogClient,
    reader,
  }),
];

return await createRouter({
  containerRunner,
  logger,
  config,
  database,
  catalogClient,
  reader,
  actions,
});
```

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: upload-to-s3
  title: Upload
  description: Uploads the workspace context to the given S3 bucket
spec:
  owner: roadie
  type: service

  parameters:
    - title: Upload to S3
      properties:
        bucket:
          title: Bucket
          type: string
          description: The context will be uploaded into this bucket

  steps:
    - id: appendFile
      name: Append To File
      action: roadiehq:utils:fs:append
      input:
        region: eu-west-1
        bucket: ${{ parameters.bucket }}
```
