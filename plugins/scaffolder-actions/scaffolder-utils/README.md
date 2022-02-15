# scaffolder-backend-module-http-request

Welcome to the roadie `utils` actions for the `scaffolder-backend`.

This contains a collection of actions: 
 - `roadiehq:utils:zip`
 - `roadiehq:utils:sleep`
 - `roadiehq:utils:fs:writeFile`

The `http:backstage:request` action allows the task to call any of the backstage APIs available to the user that triggers it. The action takes care of passing the authentication token of the user to the task execution so that the action can perform actions on behalf of the user that triggers it.

## Getting started

Create your Backstage application using the Backstage CLI as described here:
https://backstage.io/docs/getting-started/create-an-app

> Note: If you are using this plugin in a Backstage monorepo that contains the code for `@backstage/plugin-scaffolder-backend`, you need to modify your internal build processes to transpile files from the `node_modules` folder as well.

You need to configure the action in your backend:

## From your Backstage root directory

```
cd packages/backend
yarn add @roadiehq/scaffolder-utils
```

Configure the action:
(you can check the [docs](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) to see all options):

```typescript
// packages/backend/src/plugins/scaffolder.ts
import { createZipAction, createFileAction, createSleepAction } from '@roadiehq/scaffolder-utils';
...

const actions = [
  createFileAction(),
  createSleepAction(),
  createZipAction(),
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

### Example of using zip action

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: zip-dummy
  title: My custom zip action
  description: scaffolder action to zip the current context?
spec:
  owner: roadie
  type: service

  parameters:
    - title: Zip
      properties:
        zipPath:
          title: Path
          type: string
          default: "."
          description: Workspace path to zip

  steps:
    - id: zip
      name: Zip
      action: roadiehq:utils:zip
      input:
        path: ${{ parameters.zipPath }}

  output:
    path: ${{ steps.zip.output.path }}
```
