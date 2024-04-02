---
'@roadiehq/backstage-plugin-argo-cd': patch
---

Fixes an issue where the ArgoCD details card would error if any of the items returned by ArgoCD are missing the status.operationState field
