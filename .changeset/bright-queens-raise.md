---
'@roadiehq/backstage-plugin-argo-cd': patch
---

Adding the terminateOperation flag to the /sync endpoint. It is an optional boolean flag that can be set to true and it will terminate the previous Sync in progress before starting a new sync. This is a non-breaking change because if the flag is not provided and set to true the existing logic will not be impacted.
