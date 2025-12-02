---
'@roadiehq/backstage-plugin-argo-cd': patch
---

Fix: Display repository URL and path for ArgoCD applications with multiple sources

When ArgoCD applications use multiple sources via `spec.sources` array instead of `spec.source`, the DetailsDrawer component was unable to display source and path information. This fix adds a fallback to extract these values from the first source in the array when the singular source property is not available.

**Changes:**

- Updated `DetailsDrawer.tsx` to check `spec.source?.repoURL` first, then fallback to `spec.sources?.[0]?.repoURL`
- Updated `DetailsDrawer.tsx` to check `spec.source?.path` first, then fallback to `spec.sources?.[0]?.path`

This change is backwards compatible with single-source applications.

**Related:** Similar fix was applied to the history card in PR #2025
