# scaffolder-backend-module-http-request

Welcome to the `http` actions for the `scaffolder-backend`.

This contains one action: `http:backstage:request`.

The `http:backstage:request` action allows the task to call any of the backstage APIs available to the user that triggers it. The action takes care of passing the authentication token of the user to the task execution so that the action can perform actions on behalf of the user that triggers it.

## Getting started

Create your Backstage application using the Backstage CLI as described here:
https://backstage.io/docs/getting-started/create-an-app

> Note: If you are using this plugin in a Backstage monorepo that contains the code for `@backstage/plugin-scaffolder-backend`, you need to modify your internal build processes to transpile files from the `node_modules` folder as well.

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
  createHttpBackstageAction({ discovery }),
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

### New backend system

## From your Backstage root directory

```
cd packages/backend
yarn add @roadiehq/scaffolder-backend-module-http-request
```

```typescript
// packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';
import { createBackendModule } from '@backstage/backend-plugin-api';

const backend = createBackend();
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@roadiehq/scaffolder-backend-module-http-request'));
backend.start();
```

### Supported methods

Action supports following HTTP methods: `GET`, `HEAD`, `OPTIONS`, `POST`, `UPDATE`, `DELETE`, `PUT`, `PATCH`

The path should always point to a proxy entry with the following format: `proxy/<proxy-path>/<external-api-path>`

You can also point to the internal catalog apis like so: `/catalog/entities` See [https://backstage.io/docs/features/software-catalog/software-catalog-api/#get-entities](https://backstage.io/docs/features/software-catalog/software-catalog-api/#get-entities)

i.e.: `/proxy/snyk/org/<some-org>/projects` or `/proxy/circleci/api/projects` (NB: the CircleCI proxy path is `circleci/api/` but Snyk is just `snyk/`)

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
        path: '/proxy/snyk/org/<some-org>/project/<some-project-id>/aggregated-issues'
        headers:
          test: 'hello'
          foo: 'bar'

  output:
    getResponse: '{{ steps.backstage_request.output.body }}'
    getCode: '{{ steps.backstage_request.output.code }}'
    getHeaders: '{{ steps.backstage_request.output.headers }}'
```

### Example of using POST method

If the request requires a body, it can be specified using the body parameter. There are two options here

1. `content-type: application/json` header is specified. Everything under `body` hash will be converted into JSON string
2. `content-type: application/json` header is not specified. `body` treated as a plain string

> [!IMPORTANT]
> For `application/json`, the header must be set in the template as shown. Setting the header in the proxy configuration will result in the body not being transformed to a JSON string.

```yaml
steps:
  - id: backstage_request
    name: backstage request
    action: http:backstage:request
    input:
      method: 'POST'
      path: '/proxy/snyk/org/<some-org>/project/<some-project-id>/aggregated-issues'
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

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).
