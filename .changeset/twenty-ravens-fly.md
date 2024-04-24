---
'@roadiehq/backstage-plugin-jira': patch
---

Use the internal `fetchApi` instead to inject the headers properly and avoid
authentication issues in certain requests to the Jira API.
