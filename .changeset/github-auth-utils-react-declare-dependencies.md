---
'@roadiehq/github-auth-utils-react': patch
---

Declare `@types/react` as an optional peer dependency and `react-router-dom` as a peer dependency. The published types import React's types, and `@backstage/core-components` needs `react-router-dom` from the app, so they failed to resolve with strict package managers such as pnpm.
