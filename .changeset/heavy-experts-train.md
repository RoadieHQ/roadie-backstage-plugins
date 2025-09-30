---
'@roadiehq/backstage-plugin-github-pull-requests': patch
---

- Fix an issue that the GitHub Pull Requests Statistics ignores internal issues and shows undefined instead of an error message to the user.
- Fix an issue that the GitHub Pull Requests Statistics card shows undefined (or an error) if a Pull Request without commits is consumed.
