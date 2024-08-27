---
'@roadiehq/scaffolder-backend-argocd': major
---

Patch Changes:

We removed the deprecated backstage code. We are no longer using `@backstage/backend-common` and `@backstage/plugin-scaffolder-backend`. We are starting to use the `createMockActionContext` as recommended by backstage.

**BREAKING CHANGE:**

Logger parameter was removed in the `createArgoCdResources` action. This change was made because latest backstage standards are to use the logger from the `ctx` action object. Whoever is using this action will need to remove the second parameter of this action.
