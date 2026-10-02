---
'@roadiehq/backstage-plugin-argo-cd': patch
'@roadiehq/backstage-plugin-aws': patch
'@roadiehq/backstage-plugin-aws-lambda': patch
'@roadiehq/backstage-plugin-bugsnag': patch
'@roadiehq/backstage-plugin-buildkite': patch
'@roadiehq/backstage-plugin-cloudsmith': patch
'@roadiehq/backstage-plugin-github-insights': patch
'@roadiehq/backstage-plugin-github-pull-requests': patch
'@roadiehq/backstage-plugin-jira': patch
'@roadiehq/backstage-plugin-launchdarkly': patch
'@roadiehq/backstage-plugin-prometheus': patch
'@roadiehq/backstage-plugin-security-insights': patch
'@roadiehq/backstage-plugin-shortcut': patch
'@roadiehq/backstage-plugin-travis-ci': patch
'@roadiehq/backstage-plugin-wiz': patch
'@roadiehq/backstage-plugin-home-rss': patch
'@roadiehq/plugin-scaffolder-frontend-module-http-request-field': patch
---

Import `react-use` hooks from their individual modules (e.g. `react-use/esm/useAsync`) instead of the package root. This lets bundlers tree-shake unused hooks and avoids pulling in `react-use`'s broken type declarations for hooks these plugins don't use.
