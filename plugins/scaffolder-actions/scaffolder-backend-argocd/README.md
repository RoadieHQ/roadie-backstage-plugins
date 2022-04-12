# scaffolder-backend-argocd

Welcome to the `argocd` actions for the `scaffolder-backend`.

This contains one action: `argocd:create-resources`.

The `argocd:create-resources` action allows the task to call any of the Argo CD instance APIs available to the user that triggers it.

## Getting started

Create your Backstage application using the Backstage CLI as described here:
https://backstage.io/docs/getting-started/create-an-app

> Note: If you are using this plugin in a Backstage monorepo that contains the code for `@backstage/plugin-scaffolder-backend`, you need to modify your internal build processes to transpile files from the `node_modules` folder as well.

You need to configure the action in your backend:

## From your Backstage root directory

```
cd packages/backend
yarn add @roadiehq/scaffolder-backend-argocd
```

Configure the action:
(you can check the [docs](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) to see all options):

```typescript
// packages/backend/src/plugins/scaffolder.ts

const actions = [
  createArgoCdResources({ config }),
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

### Example of using GET method

```yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: HTTP-testing
  title: Http testing for post/get
  description: Testing get functionality with get
spec:
  owner: roadie
  type: service

  parameters:
    - title: Fill in some params
      properties:
        appName:
          title: App Name
          type: string
          description: The application name to be used when creating an application with ArgoCD
          ui:autofocus: true
        argoInstance:
          title: Argo Instance
          type: string
          description: The argo instance to add an application to
        namespace:
          title: Namespace
          type: string
          description: The authorized namespace for application deployment from Argo CD
        repoUrl:
          title: Repository URL
          type: string
          description: The repository URL for your deployment files
        repoPath:
          title: Repository Path
          type: string
          description: The repository path you want Argo CD to watch
        labelValue:
          title: Argo CD Label Value
          type: string
          description: The value to use with Argo CD label `backstage-name`

  steps:
    - id: create-argocd-resources
      name: Create ArgoCD Resources
      action: argocd:create-resources
      input:
        appName: ${{ parameters.appName }}
        argoInstance: ${{ parameters.cluster.cluster }}
        namespace: ${{ parameters.cluster.namespace }}
        repoUrl: ${{ steps.publish.output.remoteUrl }}
        labelValue: ${{ parameters.name }}
        path: "k8s/nonprod"

  output:
    getResponse: '{{ steps.backstage_request.output.body }}'
    getCode: '{{ steps.backstage_request.output.code }}'
    getHeaders: '{{ steps.backstage_request.output.headers }}'
```

### Example of using POST method

If the request requires a body, it can be specified using the body parameter. There are two options here

1. `content-type: application/json` header is specified. Everything under `body` hash will be converted into JSON string
2. `content-type: application/json` header is not specified. `body` treated as a plain string

```yaml
steps:
  - id: backstage_request
    name: backstage request
    action: http:backstage:request
    input:
      method: 'POST'
      path: '/api/proxy/snyk/org/org/project/project-id/aggregated-issues'
      headers:
        content-type: 'application/json'
      body:
        name: 'test'
        bar: 'foo'

output:
  getResponse: '{{ steps.backstage_request.output.body }}'
  getCode: '{{ steps.backstage_request.output.code }}'
  getHeaders: '{{ steps.backstage_request.output.headers }}'
```

Snippet above will send the following HTTP request:

```sh
--------  127.0.0.1:53321 | POST /
Headers
"Accept" : ["*/*"]
"Content-Type" : ["application/json"]
"Connection" : ["close"]
"User-Agent" : ["node-fetch/1.0 (+https://github.com/bitinn/node-fetch)"]
"Content-Length" : ["27"]
00000000  7b 22 6e 61 6d 65 22 3a  22 74 65 73 74 22 2c 22  |{"name":"test","|
00000010  62 61 72 22 3a 22 66 6f  6f 22 7d                 |bar":"foo"}|
```

You can also visit the `/create/actions` route in your Backstage application to find out more about the parameters this action accepts when it's installed to configure how you like.
