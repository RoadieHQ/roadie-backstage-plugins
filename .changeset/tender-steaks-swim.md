---
'@roadiehq/catalog-backend-module-okta': minor
---

Add smarter pruning of empty groups. Previously, parent groups of groups with members were being pruned. This change includes parent groups if their decendants have members.
