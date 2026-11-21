---
'@roadiehq/backstage-plugin-github-insights': patch
---

Declare `@backstage/filter-predicates` as a dependency, `@types/react` as an optional peer dependency and `react-router-dom` as a peer dependency. The published types import the first two, and the Backstage packages this plugin uses need `react-router-dom` from the app, so they failed to resolve with strict package managers such as pnpm.
