# scaffolder-backend-module-shell

Welcome to the `shell:run` action for the `scaffolder-backend`.

## Getting started

You need to configure the action in your backend:

## From your Backstage root directory

```
cd packages/backend
yarn add @backstage/plugin-scaffolder-backend-module-shell
```

Configure the action:
(you can check the [docs](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) to see all options):

```typescript
// packages/backend/src/plugins/scaffolder.ts

const actions = [
  createShellRunAction({
    containerRunner,
  }),
  ...createBuiltInActions({
    ...
  })
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

After that you can use the action in your template:

```yaml
apiVersion: backstage.io/v1beta2
kind: Template
metadata:
  name: shell-run-demo
  title: Shell Run Test
  description: Shell example
spec:
  owner: backstage/techdocs-core
  type: service

  parameters:
    - title: Fill in some steps
      required:
        - name
      properties:
        name:
          title: Name
          type: string
          description: Unique name of the component
          ui:autofocus: true
          ui:options:
            rows: 5

  steps:
    - id: shell-run
      name: Shell Run
      action: shell:run
      input:
        command: "ls -ltr"
```

You can also visit the `/create/actions` route in your Backstage application to find out more about the parameters this action accepts when it's installed to configure how you like.