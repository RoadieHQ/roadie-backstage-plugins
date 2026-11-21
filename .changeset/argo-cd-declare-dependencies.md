---
'@roadiehq/backstage-plugin-argo-cd': patch
---

Declare `@backstage/filter-predicates` as a dependency and `@types/react` as an optional peer dependency. The published types import both, so they failed to resolve with strict package managers such as pnpm.
