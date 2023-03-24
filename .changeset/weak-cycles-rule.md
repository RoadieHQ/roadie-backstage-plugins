---
'@roadiehq/backstage-plugin-argo-cd-backend': patch
'@roadiehq/backstage-plugin-argo-cd': patch
---

Added API to call managed-resources of ArgoCD application, this feature is locked behind a feature flag that needs to be enabled. It will fetch commonly used annotations from resources to show the App Version and Chart version of an ArgoCD application.
