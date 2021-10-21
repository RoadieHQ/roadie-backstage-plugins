# scaffolder-backend-module-yeoman

Welcome to the `http` actions for the `scaffolder-backend`.

## Getting started

You need to configure the action in your backend:

## From your Backstage root directory

```
cd packages/backend
yarn add @backstage/plugin-scaffolder-backend-module-http-request
```

Configure the action:
(you can check the [docs](https://backstage.io/docs/features/software-templates/writing-custom-actions#registering-custom-actions) to see all options):

```typescript
// packages/backend/src/plugins/scaffolder.ts

const actions = [
  createHttpAction(),
  createHttpBackstageAction({ config }),
  ...createBuiltInActions({
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
  description: tetsing get/post functionality with get + post
spec:
  owner: backstage/techdocs-core
  type: service

  parameters:
    - title: Fill in some params
      properties:
        httpGetUrl:
          title: Get Url
          type: string
          description: The url endpoint you want to get
          ui:autofocus: true
          ui:options:
            rows: 5

  steps:
    - id: get_request
      name: Get request
      action: http:request
      input:
        method: 'GET'
        url: '{{ parameters.httpGetUrl }}'
        headers:
          test: 'hello'
          foo: 'bar'
        params:
          nic: 'test'
          bar: 'foo'

    - id: backstage_request
      name: backstage request
      action: http:backstage:request
      input:
        method: 'POST'
        path: '/api/proxy/snyk/org/org/project/project-id/aggregated-issues'
        headers:
          test: 'hello'
          foo: 'bar'
        body:
          nic: 'test'
          bar: 'foo'

  output:
    getResponse: '{{ steps.get_request.output.body }}'
    getCode: '{{ steps.get_request.output.code }}'
    getHeaders: '{{ steps.get_request.output.headers }}'
    proxyResponse: '{{ steps.proxy_request.output.body }}'
    proxyCode: '{{ steps.proxy_request.output.code }}'
    proxyHeaders: '{{ steps.proxy_request.output.headers }}'
```

You can also visit the `/create/actions` route in your Backstage application to find out more about the parameters this action accepts when it's installed to configure how you like.
