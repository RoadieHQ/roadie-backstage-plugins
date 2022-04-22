# scaffolder-backend-argocd

Welcome to the `argocd` actions for the `scaffolder-backend`.

This contains one action: `argocd:create-resources`.

The `argocd:create-resources` action allows the task to call any of the Argo CD instance APIs available to the user that triggers it.

## Getting started

Create your Backstage application using the Backstage CLI as described here:
https://backstage.io/docs/getting-started/create-an-app

> Note: If you are using this plugin in a Backstage monorepo that contains the code for `@backstage/plugin-scaffolder-backend`, you need to modify your internal build processes to transpile files from the `node_modules` folder as well.

> Note: To use this scaffolder action you need to ensure the Argo CD user you are utilizing has the `create` permission for both `projects` and `applications`

You need to configure the action in your backend as well as your software template:

### From your Backstage root directory

```
cd packages/backend
yarn add @roadiehq/scaffolder-backend-argocd
```

Configure the action:
(you can check the [docs](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) to see all options):

```typescript
// packages/backend/src/plugins/scaffolder.ts

const actions = [
  createArgoCdResources({ config, logger }),
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

### From your software template yaml file

Under `spec.steps[]` insert the below. In the below we reference items in the `spec.paramters[]` section.

```
    - id: create-argocd-resources
      name: Create ArgoCD Resources
      action: argocd:create-resources
      input:
        appName: ${{ parameters.name }}-nonprod
        argoInstance: ${{ parameters.argoinstance }}
        namespace: ${{ parameters.namespace }}
        repoUrl: ${{ steps.publish.output.remoteUrl }}
        labelValue: ${{ parameters.name }}
        path: "kubernetes/nonprod"
```

> If needed there is an optional parameter of `projectName` as well.

## Contributed By American Airlines