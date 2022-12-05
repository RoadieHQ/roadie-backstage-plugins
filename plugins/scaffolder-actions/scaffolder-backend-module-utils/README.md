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
import {
  createZipAction,
  createSleepAction,
  createWriteFileAction,
  createAppendFileAction,
  createMergeJSONAction,
  createMergeAction,
  createParseFileAction,
  createSerializeYamlAction,
  createSerializeJsonAction,
  createJSONataAction,
  createYamlJSONataTransformAction,
  createJsonJSONataTransformAction,
} from '@roadiehq/scaffolder-backend-module-utils';
...

const actions = [
  createZipAction(),
  createSleepAction(),
  createWriteFileAction(),
  createAppendFileAction(),
  createMergeJSONAction({}),
  createMergeAction(),
  createAwsS3CpAction(),
  createEcrAction(),
  createParseFileAction(),
  createSerializeYamlAction(),
  createSerializeJsonAction(),
  createJSONataAction(),
  createYamlJSONataTransformAction(),
  createJsonJSONataTransformAction(),
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

### Example of using parseFile action

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: parse-file-template
  title: Parse From File
  description: Example temaplte to parse from a file with on the given path with the given content in the workspace.
spec:
  owner: roadie
  type: service

  parameters:
    - title: Parse From File
      properties:
        path:
          title: Path
          type: string
          description: The path to the file
        parser:
          title: Parser
          type: string
          enum:
            - yaml
            - json
            - multiyaml
          description: The content to parse from the file
  steps:
    - id: parsefile
      name: Parse File
      action: roadiehq:utils:fs:parse
      input:
        path: ${{ parameters.path }}
        parser: ${{ parameters.parser }}
  output:
    path: ${{ steps.serialize.output.content }}
```

### Example of using jsonata action

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: Jsonata
  title: Jsonata
  description: Example template to perform a jsonata expression on input data
spec:
  owner: roadie
  type: service

  parameters: []
  steps:
    - id: jsonata
      name: Parse File
      action: roadiehq:utils:jsonata
      input:
        data:
          items:
            - item1
        expression: '$ ~> | $ | { "items": [items, "item2"] }|'
  output:
    path: ${{ steps.serialize.output.result }}
```

### Example of using jsonata expression to transform a JSON file

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: Jsonata
  title: Jsonata
  description: Example template to perform a jsonata expression on input data
spec:
  owner: roadie
  type: service

  parameters: []
  steps:
    - id: jsonata
      name: Parse File
      action: roadiehq:utils:jsonata:json:transform
      input:
        path: input-data.jaon
        expression: '$ ~> | $ | { "items": [items, "item2"] }|'
        writeOutputPath: output-data.json
  output:
    path: ${{ steps.serialize.output.result }}
```

### Example of using jsonata expression to transform a YAML file

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: Jsonata
  title: Jsonata
  description: Example template to perform a jsonata expression on input data
spec:
  owner: roadie
  type: service

  parameters: []
  steps:
    - id: jsonata
      name: Jsonata
      action: roadiehq:utils:jsonata:yaml:transform
      input:
        path: input-data.yaml
        expression: '$ ~> | $ | { "items": [items, "item2"] }|'
        writeOutputPath: output-data.yaml
  output:
    path: ${{ steps.serialize.output.result }}
```

### Example of serializing data to a YAML format

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: serialize
  title: serialize
  description: Example template to serialize data to the YAML format
spec:
  owner: roadie
  type: service

  parameters: []
  steps:
    - id: serialize
      name: serialize
      action: roadiehq:utils:serialize:yaml
      input:
        data:
          hello: world
  output:
    path: ${{ steps.serialize.output.serialized }}
```

### Example of serializing data to a JSON format

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: serialize
  title: Jsonata
  description: Example template to serialize data to the JSON format
spec:
  owner: roadie
  type: service

  parameters: []
  steps:
    - id: serialize
      name: serialize
      action: roadiehq:utils:serialize:json
      input:
        data:
          hello: world
  output:
    path: ${{ steps.serialize.output.serialized }}
```
