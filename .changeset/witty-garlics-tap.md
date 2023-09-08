---
'@roadiehq/backstage-plugin-github-insights': patch
---

The `MarkdownContent` component currently removes only single line comments if `preserveHtmlComments` is not set.
This change accounts for single line and multiline HTML comments
