---
'@roadiehq/backstage-plugin-github-insights': patch
---

Fixes for https://github.com/RoadieHQ/roadie-backstage-plugins/issues/1118

- Relative links should be rendered as https://<github-url>/<org>/<repo>/blob/develop/<relative-link>
- Images should be rendered, even if the URL is relative (example: src=“image/cover.png”)
- External links should be opened in a new tab
- Support for GitHub Enterprise (not only GitHub.com)
