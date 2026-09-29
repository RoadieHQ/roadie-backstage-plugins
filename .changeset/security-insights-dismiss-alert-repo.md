---
'@roadiehq/backstage-plugin-security-insights': patch
---

Fix dismissing a code scanning alert from the severity status modal, which always sent the request to the `RoadieHQ/backstage` repository instead of the entity's own repository.
