# scaffolder-backend-module-http-request

Welcome to the `http` actions for the `scaffolder-backend`.

This contains one action; `http:backstage:request`.

The `http:backstage:request` action allows the task to call any of the backstage APIs available to the user that triggers it. The action takes care of passing the authentication token of the user to the task execution so that the action can perform actions on behalf of the user that triggers it.

## Getting started

You need to configure the action in your backend:

## From your Backstage root directory

```
cd packages/backend
yarn add @roadiehq/scaffolder-backend-module-http-request
```

Configure the action:
(you can check the [docs](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) to see all options):

```typescript
// packages/backend/src/plugins/scaffolder.ts

const actions = [
  createHttpBackstageAction({ config }),
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

After that you can use the action in your template:

```yaml
---
apiVersion: backstage.io/v1beta2
kind: Template
metadata:
  name: HTTP-testing
  title: Http testing for post/get
  description: Testing get/post functionality with get + post
spec:
  owner: roadie
  type: service

  parameters:
    - title: Fill in some params
      properties:
        httpGetPath:
          title: Get Path
          type: string
          description: The path you want to get on your backstage instance
          ui:autofocus: true
          ui:options:
            rows: 5

  steps:
    - id: backstage_request
      name: backstage request
      action: http:backstage:request
      input:
        method: 'GET'
        path: '/api/proxy/snyk/org/org/project/project-id/aggregated-issues'
        headers:
          test: 'hello'
          foo: 'bar'
        body:
          name: 'test'
          bar: 'foo'

  output:
    getResponse: '{{ steps.backstage_request.output.body }}'
    getCode: '{{ steps.backstage_request.output.code }}'
    getHeaders: '{{ steps.backstage_request.output.headers }}'
```

You can also visit the `/create/actions` route in your Backstage application to find out more about the parameters this action accepts when it's installed to configure how you like.
