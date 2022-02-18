# scaffolder-backend-module-utils actions package

Welcome to the roadie `utils` actions for the `scaffolder-backend`.

This contains a collection of actions: 
 - `roadiehq:utils:zip`
 - `roadiehq:utils:sleep`
 - `roadiehq:utils:fs:write`
 - `roadiehq:utils:fs:append`

## Getting started

Create your Backstage application using the Backstage CLI as described here:
https://backstage.io/docs/getting-started/create-an-app

> Note: If you are using this plugin in a Backstage monorepo that contains the code for `@backstage/plugin-scaffolder-backend`, you need to modify your internal build processes to transpile files from the `node_modules` folder as well.

You need to configure the action in your backend:

## From your Backstage root directory

```
cd packages/backend
yarn add @roadiehq/scaffolder-backend-module-utils
```

Configure the action:
(you can check the [docs](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) to see all options):

Here you can pick the actions that you'd like to register to your backstage instance.

```typescript
// packages/backend/src/plugins/scaffolder.ts
import { createZipAction, createWriteFileAction, createAppendFileAction, createSleepAction } from '@roadiehq/scaffolder-backend-module-utils';
...

const actions = [
  createFileAction(),
  createSleepAction(),
  createZipAction(),
  createAppendFileAction(),
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
        path:
          title: Path
          type: string
          description: Workspace path to zip
        outputPath:
          title: Path
          type: string
          description: The path of the zip file

  steps:
    - id: zip
      name: Zip
      action: roadiehq:utils:zip
      input:
        path: ${{ parameters.path }}
        outputPath: ${{ parameters.outputPath }}

  output:
    path: ${{ steps.zip.output.path }}
```
### Example of using sleep action

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: sleep-dummy
  title: Sleep template
  description: A template with only one sleep example action that will ask for a user input for the amount of seconds it should sleep
spec:
  owner: roadie
  type: service

  parameters:
    - title: Sleep
      properties:
        amount:
          title: Amount to sleep
          type: number
          description: Will sleep for this amount of seconds

  steps:
    - id: sleep
      name: sleep
      action: roadiehq:utils:sleep
      input:
        path: ${{ parameters.amount }}
```
### Example of using writeFile action

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: create-file-template
  title: Create File template
  description: Example temaplte to create a file with on the given path with the given content in the workspace.
spec:
  owner: roadie
  type: service

  parameters:
    - title: Create File
      properties:
        path:
          title: Path
          type: string
          description: The path to the desired new file
        content:
          title: Content
          type: string
          description: The content of the newly created file
  steps:
    - id: writeFile
      name: Create File
      action: roadiehq:utils:fs:write
      input:
        path: ${{ parameters.path }}
        content: ${{ parameters.content }}
```
### Example of using appendFile action

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: append-file-template
  title: Append To File template
  description: Example temaplte to append to a file with on the given path with the given content in the workspace.
spec:
  owner: roadie
  type: service

  parameters:
    - title: Append To File
      properties:
        path:
          title: Path
          type: string
          description: The path to the file
        content:
          title: Content
          type: string
          description: The content to append to the file
  steps:
    - id: appendFile
      name: Append To File
      action: roadiehq:utils:fs:append
      input:
        path: ${{ parameters.path }}
        content: ${{ parameters.content }}
```

