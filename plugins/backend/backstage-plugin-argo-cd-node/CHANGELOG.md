# @roadiehq/backstage-plugin-argo-cd-node

## 2.0.0

### Major Changes

- 64afd10: Split ArgocdServiceRef into it's own node package

## 1.0.0

### Major Changes

- Initial release. Extracts `ArgoServiceApi`, all shared ArgoCD types, and `argocdServiceRef` from `@roadiehq/backstage-plugin-argo-cd-backend` into a dedicated node library package.

  This follows the standard Backstage `-node` library pattern, allowing other backend plugins to declare a lightweight dependency on the ArgoCD service interface without depending on the full backend plugin.

  **Migration from `@roadiehq/backstage-plugin-argo-cd-backend`:**

  Replace your import:

  ```ts
  // Before
  import { argocdServiceRef } from '@roadiehq/backstage-plugin-argo-cd-backend';

  // After
  import { argocdServiceRef } from '@roadiehq/backstage-plugin-argo-cd-node';
  ```

  Update your `package.json` dependency:

  ```json
  // Before
  "@roadiehq/backstage-plugin-argo-cd-backend": "^4.x.x"

  // After
  "@roadiehq/backstage-plugin-argo-cd-node": "^1.0.0"
  ```
