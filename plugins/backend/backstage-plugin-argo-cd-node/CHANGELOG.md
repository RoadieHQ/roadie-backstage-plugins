# @roadiehq/backstage-plugin-argo-cd-node

## 2.1.0

### Minor Changes

- bb31bd0: New features:

  - Added debug logs when the Argo Session API returns an unexpected HTML response.
  - Purposefully throwing error when response contains html instead of the error thrown when attempting to parse a non json response.

  Reasoning: Depending on the deployment environment, traffic to the Argo API may pass through edge security, web application firewall (WAF), or content delivery network (CDN) services such as Akamai, F5, or Cloudflare. When routing failures occur, these services may return an HTML response instead of the expected API response.

  Previously, these responses were truncated in logs, making it difficult to access diagnostic information — such as reference IDs — that can help identify the source of the failure. This change improves observability by logging unexpected HTML responses, providing additional context for troubleshooting and root-cause analysis.

  Behavior: No functional behavior has changed. This change only adds additional warning-level logging for unexpected HTML responses to the session endpoint. Does not log when content type includes application/json

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
