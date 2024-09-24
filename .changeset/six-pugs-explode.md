---
'@roadiehq/catalog-backend-module-okta': major
---

Upgrade the catalog module to the backend system.

BREAKING:

- Interfaces have been updated to favour backend system configurations over legacy system ones.
- Original provider factory interface has been changed to accept only okta configurations.
- Configuration has been modified to contain schedules

Adds default configurations for the provider that can be added in. Leaves a customizable module construction option so more use cases can be covered.
