---
'app': patch
'@roadiehq/backstage-plugin-argo-cd-backend': patch
'@roadiehq/backstage-plugin-aws-lambda': patch
'@roadiehq/backstage-plugin-buildkite': patch
'@roadiehq/backstage-plugin-github-insights': patch
'@roadiehq/scaffolder-backend-module-http-request': patch
---

Change default port of backend from 7000 to 7007.

This is due to the AirPlay Receiver process occupying port 7000 and preventing local Backstage instances on MacOS to start.
