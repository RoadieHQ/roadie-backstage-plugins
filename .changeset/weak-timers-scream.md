---
'@roadiehq/backstage-plugin-jira': minor
---

Added a new way to fetch the issues and count them. Added a functionality to filter the activity stream by component name (if present). What's more, if Confluence is also configured and connected to your JIRA instance, you might need to define the `jira.confluenceActivityFilter` variable in your `app-config.yaml` to avoid those activities to be shown in your Activity Stream.

In case the annotation `jira/component` is not present, the plugin will work exactly in the same way as in the previous versions.
