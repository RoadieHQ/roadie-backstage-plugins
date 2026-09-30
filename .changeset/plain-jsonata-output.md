---
'@roadiehq/scaffolder-backend-module-utils': patch
---

Fix `roadiehq:utils:jsonata` failing with "Template arrays cannot have custom properties" on Backstage 1.54+ by returning plain arrays instead of JSONata sequences.
