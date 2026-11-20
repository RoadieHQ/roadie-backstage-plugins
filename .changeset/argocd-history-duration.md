---
'@roadiehq/backstage-plugin-argo-cd': patch
---

Fix the "Took" duration in the ArgoCD history table. It subtracted the end time from the start time, so a deployment that took 1 minute 32 seconds showed as `Took 00:-01:-32`. It now shows `Took 00:01:32`.
