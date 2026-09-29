---
'@roadiehq/backstage-plugin-github-insights': patch
---

Move the `entity-card:github-insights/readme` extension config to the `configSchema` option using Zod v4, since the deprecated `config.schema` option was removed in `@backstage/frontend-plugin-api`. The supported config (`maxHeight`, `title`) is unchanged.
