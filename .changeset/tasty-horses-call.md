---
'@roadiehq/catalog-backend-module-okta': patch
---

Added the `profile-name` `GroupNamingStrategy`. This strategy names Group entities exactly as their group profile name. ⚠ The Okta field supports characters not supported as [entity names in backstage](https://backstage.io/docs/features/software-catalog/descriptor-format#name-required). ⚠
