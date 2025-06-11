---
'@roadiehq/backstage-plugin-argo-cd': patch
---

Fixing crashing when using the `argocd` plugin with the new frontend system. The wrong Blueprint type was used, as this should be a tab used within context of an Entity.
