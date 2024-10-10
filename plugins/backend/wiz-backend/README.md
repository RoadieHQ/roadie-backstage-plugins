# Roadie WIZ Backend plugin for Backstage

This plugin is the backend for WIZ Backstage plugin. You can see the corresponding frontend plugin in [here](/plugins/frontend/backstage-plugin-wiz/README.md).

This plugin provides functionality to retrieve corresponding access token, needed for API calls and retriving data, based on clientId, clientSecret and tokenURL.

## Prerequisites

To begin using Wiz backend plugin, you will need the following parameters:

- Wiz API URL (API Endpoint URL)
- Wiz Token URL
- Client ID and Client Secret

In order to retrieve those, you can read official documentation (https://win.wiz.io/reference/prerequisites) where it is described how to obtain the values.

The Wiz GraphQL API has a single endpoint
https://api.<TENANT_DATA_CENTER>.app.wiz.io/graphql, where <TENANT_DATA_CENTER> is the Wiz regional data center your tenant resides, e.g., us1, us2, eu1 or eu2.

## Getting started

After obtaining all of the above, add wiz configuration in your app-config.yaml

```yaml
wiz:
  clientId: <Client ID>
  clientSecret: <Client Secret>
  tokenUrl: <Wiz token URL>
  wizAPIUrl: <API Endpoint URL>
```

Create a file in `packages/backend/src/plugins/wiz.ts`

```typescript
import { createRouter } from '@roadiehq/plugin-wiz-backend';
import type { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  config,
}: PluginEnvironment) {
  return await createRouter({ logger, config });
}
```

In `packages/backend/src/index.ts` add the following:

```typescript
import wiz from './plugins/wiz';
// ...
async function main() {
  // ...
  const wizEnv = useHotMemoize(module, () => createEnv('wiz'));
  const apiRouter = Router();
  apiRouter.use('/wiz-backend', await wiz(wizEnv));
  // ...
}
```

At this point you can generate access token you will need for API calls towards WIZ.
