---
'@roadiehq/backstage-plugin-bugsnag': minor
---

**BREAKING** Change the `bugsnag.com/project-key` annotation from `OrganizationName/projectApiKey` to `OrganizationName/ProjectName`.

This change allows (optionally) changing the content of the `bugsnag.com/project-key` annotation to `Organization name/Project name`. As this already contains the project name, the `bugsnag.com/project-name` annotation becomes deprecated. Configuring the plugin this way makes more sense, as the secret api-key can be kept out of the repositories. The plugin will detect if the plugin is configured with an old annotation, and revert to the old behaviour if needed.

Improve the display of data in the table:

- It adds the description and the status to the table.
- It adds filtering options to the table.

Bugfixes:

- Don't throw an error if the annotation is missing.
- If there are multiple stages, they are now joined with a comma.
