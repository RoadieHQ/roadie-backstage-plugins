---
'@roadiehq/backstage-plugin-github-pull-requests': major
'@roadiehq/backstage-plugin-github-insights': major
---

BREAKING: Needs SCM auth API to be configured in the application.

Migrate to use SCM auth instead of direct GitHub to allow possibility to work with multiple GitHub integrations at once.
