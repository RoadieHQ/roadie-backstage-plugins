---
'@roadiehq/backstage-plugin-argo-cd-backend': patch
---

Match the instance name from findArgoApp results with the actual configured instance from this.instanceConfigs before calling getArgoToken():
