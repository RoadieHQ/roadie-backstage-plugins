# scaffolder-backend-module-aws actions package

Welcome to the roadie `aws` actions for the `scaffolder-backend`.

This contains a collection of actions:

- `roadiehq:aws:s3:cp`
- `roadiehq:aws:ecr:create`
- `roadiehq:aws:secrets-manager:create`

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

Import the action that you'd like to register to your backstage instance.

```typescript
// packages/backend/src/plugins/scaffolder.ts
import { createAwsS3CpAction, createEcrAction, createAwsSecretsManagerCreateAction } from '@roadiehq/scaffolder-backend-module-aws';
...

const actions = [
  createAwsS3CpAction(),
  createEcrAction(),
  createAwsSecretsManagerCreateAction(),
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

This action accepts an optional `credentials` parameter. Which should be a `CredentialProvider` interface from the [@aws-sdk/credential-provider](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_providers.html) If you want to override the `@aws-sdk/client-s3` module's default authentication, provide a valid credential to the action.

Example:

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

# Template

##### For s3 cp

This is a minimum template to use this action. It accepts one required parameter `bucket`. And will upload the whole workspace context to this bucket.

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
        required: ['bucket']
        bucket:
          title: Bucket
          type: string
          description: The context will be uploaded into this bucket

  steps:
    - id: uploadToS3
      name: Upload to S3
      action: roadiehq:aws:s3:cp
      input:
        region: eu-west-1
        bucket: ${{ parameters.bucket }}
```

##### For ECR create action

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: create-ecr-repo-template
  title: Create ECR Repository
  description: Create ECR repository using scaffolder custom action
spec:
  owner: roadie
  type: service

  parameters:
    - title: Add Repository Details
      required:
        - RepoName
        - Region
      properties:
        RepoName:
          title: ECR Repository Name
          type: string
          description: The ECR repository Name
          ui:autofocus: true
        Region:
          title: aws region
          type: string
          description: region for aws ECR
          default: 'us-east-1'
        ImageMutability:
          title: Enable Image Mutability
          description: set image mutability to true or false
          type: boolean
          default: false
        ScanOnPush:
          title: Enable Image Scanning
          description: The image scanning configuration for the repository. This determines whether images are scanned for known vulnerabilities after being pushed to the repository.
          type: boolean
          default: false
        Tags:
          type: array
          items:
            type: object
            description: Repository tags
            title: tag
            properties:
              Key:
                type: string
                title: Key
              Value:
                type: string
                title: Value

  steps:
    - id: create-ecr
      name: Create ECR Rrepository
      action: roadiehq:aws:ecr:create
      input:
        repoName: ${{ parameters.RepoName }}
        tags: ${{parameters.Tags}}
        imageMutability: ${{parameters.ImageMutability}}
        scanOnPush: ${{parameters.ScanOnPush}}
        region: ${{parameters.Region}}
```

##### For Secrets Manager create action

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: create-secret-repo-template
  title: Create Secret
  description: Create secret in Secrets Manager using scaffolder custom action
spec:
  owner: roadie
  type: service

  parameters:
    - title: Add Secret Details
      required:
        - Name
        - Region
      properties:
        Name:
          title: Secret name
          type: string
          description: name of the secret to be created
          ui:autofocus: true
        Description:
          title: Description
          type: string
          description: description of the secret
        Value:
          title: Value
          description: secret string value
          type: string
        Tags:
          type: array
          items:
            type: object
            description: Secret tags
            title: tag
            properties:
              Key:
                type: string
                title: Key
              Value:
                type: string
                title: Value
        Profile:
          title: AWS profile
          description: AWS profile
          type: string
          default: 'default'
        Region:
          title: AWS region
          type: string
          description: region for aws secrets manager
          default: 'us-east-1'

  steps:
    - id: createSecret
      name: create secret - prod
      action: roadiehq:aws:secrets-manager:create
      input:
        name: ${{ parameters.Name }}
        description: ${{ parameters.Description }}
        value: ${{ parameters.Value }}
        tags: ${{parameters.Tags}}
        profile: ${{parameters.Profile}}
        region: ${{parameters.Region}}
```
