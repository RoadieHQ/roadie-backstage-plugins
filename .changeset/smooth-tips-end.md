---
'@roadiehq/backstage-plugin-argo-cd': patch
'@roadiehq/backstage-plugin-buildkite': patch
'@roadiehq/backstage-plugin-datadog': patch
'@roadiehq/backstage-plugin-github-insights': patch
'@roadiehq/backstage-plugin-github-pull-requests': patch
'@roadiehq/backstage-plugin-security-insights': patch
'@roadiehq/backstage-plugin-travis-ci': patch
---

Move react-router and react-router-dom dependencies to peerDependencies because of the migration to the stabel version of react-router in backstage/backstage. See the migration guide [here](https://backstage.io/docs/tutorials/react-router-stable-migration#for-plugin-authors)
