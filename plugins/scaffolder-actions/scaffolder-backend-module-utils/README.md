# scaffolder-backend-module-utils actions package

## Intro

Welcome to the roadie `utils` actions for the `scaffolder-backend`.

This contains a collection of actions to use in scaffolder templates:

- [Zip](#zip)
- [Sleep](#sleep)
- [De-serialise a file](#de-serialise)
- [Serialise to json or yaml](#serialise)
- [Extract values from Json](#parse-json)

## Setup

##¢ Setting up Backstage

Create your Backstage application using the Backstage CLI as described here:
https://backstage.io/docs/getting-started/create-an-app

> Note: If you are using this plugin in a Backstage monorepo that contains the code for `@backstage/plugin-scaffolder-backend`, you need to modify your internal build processes to transpile files from the `node_modules` folder as well.

You need to configure the action in your backend:

### Installing the actions

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

## Actions:

### Zip - `roadiehq:utils:zip`

Compress files and store them to the temporary workspace in .zip format.

_Required Params:_

- path: The path in your workspace of the file you want to zip
- outputPath: The path you want to use to save the generated zip file.

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
    outputPath: ${{ steps.zip.output.path }}
```

### Sleep - `roadiehq:utils:sleep`

Waits a number of seconds before continuing to the next scaffolder step.

_Required params:_

- amount: Number of seconds to sleep

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

### De-serialise - `roadiehq:utils:fs:parse`

This action de-serialises json or yaml files in the temporary scaffolder workspace to a javascript object in memory that can then be passed to another step.

Required params:

- path: The path to the file in the temporary scaffolder workspace that you want to de-serialaise
- parser: The type of content found in the file you want to de-serialise

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: parse-file-template
  title: Parse From File
  description: Example template to parse from a file with on the given path with the given content in the workspace.
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
    content: ${{ steps.serialize.output.content }}
```

### Parse JSON - `roadiehq:utils:jsonata`

This action allows you to parse a file in your workspace or output from a previous step and extract values from Json to output or use in subsequent actions.

This action uses [Jsonata](https://jsonata.org/) to parse Json. You can test Jsonata expressions [here](https://try.jsonata.org/) while writing your template.

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
    result: ${{ steps.serialize.output.result }}
```

Transform a JSON file:

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
  output:
    result: ${{ steps.serialize.output.result }}
```

Transform a YAML file:

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
  output:
    result: ${{ steps.serialize.output.result }}
```

### Write - `roadiehq:utils:fs:write`

This action writes a string to a temporary file in the scaffolder workspace.

_Required params:_

- path: The file path you want to save your new file at in the workspace.
- content: The string content you want to write.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: create-file-template
  title: Create File template
  description: Example template to create a file with on the given path with the given content in the workspace.
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

### Append - `roadiehq:utils:fs:append`

This action adds content to the end of an existing file or creates a new one if it doesn't already exist.

_Required params:_

- path: The path of the file you want to add content to in the workspace.
- content: The string content you want to append.

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: append-file-template
  title: Append To File template
  description: Example template to append to a file with on the given path with the given content in the workspace.
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
          title: Text area input
          type: string
          description: Add your new entity
          ui:widget: textarea
          ui:options:
            rows: 10
          ui:help: 'Make sure it is valid by checking the schema at `/tools/entity-preview`'
          ui:placeholder: |
            ---
            apiVersion: backstage.io/v1alpha1
              kind: Component
              metadata:
                name: backstage
              spec:
                type: library
                owner: CNCF
                lifecycle: experimental
  steps:
    - id: appendFile
      name: Append To File
      action: roadiehq:utils:fs:append
      input:
        path: ${{ parameters.path }}
        content: ${{ parameters.content }}
```

### Serialise to json or yaml - `roadiehq:utils:serialize:[json|yaml]`

This action creates a json or yaml formatted string representation of key value pairs written in yaml under the data input field.

#### To yaml:

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
    yaml: ${{ steps.serialize.output.serialized }}
```

// input:

```js
{
  hello: 'world';
}
```

// output:

```yaml
---
hello: world
```

#### To JSON:

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
    json: ${{ steps.serialize.output.serialized }}
```

// input:

```js
{
  hello: 'world';
}
```

// output: `"\"hello\": \"world\""`
