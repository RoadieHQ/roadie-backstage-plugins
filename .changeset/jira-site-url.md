---
'@roadiehq/backstage-plugin-jira': minor
---

Add optional `jira.siteUrl` config. When set, "Open in Jira" links are built from it instead of the `self` URL returned by the API, which does not point at the Jira UI when the API is reached through another host such as the Atlassian gateway (`https://api.atlassian.com/ex/jira/{cloudId}`) used by scoped API tokens and service accounts.
