# @roadiehq/backstage-plugin-argo-cd-node

This package is a **node library** for the [Argo CD Backstage plugin](../backstage-plugin-argo-cd-backend/README.md). It provides the shared service reference and TypeScript types that other backend plugins can depend on to interact with ArgoCD — without taking a full dependency on the backend plugin itself.

## Installation

```bash
# yarn
yarn add @roadiehq/backstage-plugin-argo-cd-node
```

## Usage

### Consuming the ArgoCD service in another backend plugin

Import `argocdServiceRef` and declare it as a dependency in your plugin's `registerInit`:

```typescript
import { argocdServiceRef } from '@roadiehq/backstage-plugin-argo-cd-node';
import {
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';

export const myPlugin = createBackendPlugin({
  pluginId: 'my-plugin',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        argoService: argocdServiceRef,
      },
      async init({ logger, argoService }) {
        const apps = await argoService.findArgoApp({ selector: 'my-selector' });
        logger.info(`Found ${apps.length} ArgoCD apps`);
      },
    });
  },
});
```

> **Important:** `@roadiehq/backstage-plugin-argo-cd-backend` must be registered in your Backstage backend for the service implementation to be available at runtime.

## What's in this package

| Export             | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `argocdServiceRef` | `ServiceRef<ArgoServiceApi>` — wire this into your plugin's deps |
| `ArgoServiceApi`   | TypeScript interface describing the full ArgoCD service API      |
| All ArgoCD types   | `InstanceConfig`, `findArgoAppResp`, `SyncResponse`, etc.        |

## Architecture

This package follows the standard Backstage **`-node` library** pattern (see `@backstage/plugin-catalog-node`, `@backstage/plugin-auth-node`). It contains **only** the public interface and service reference — no implementation code, no HTTP handlers. The concrete `ArgoService` implementation lives in `@roadiehq/backstage-plugin-argo-cd-backend`.

```
@roadiehq/backstage-plugin-argo-cd-node      ← you depend on this
  └── ArgoServiceApi (interface)
  └── argocdServiceRef (ServiceRef)

@roadiehq/backstage-plugin-argo-cd-backend   ← registers the implementation
  └── ArgoService implements ArgoServiceApi
  └── depends on argo-cd-node
```
