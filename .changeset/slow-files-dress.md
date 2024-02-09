---
'@roadiehq/catalog-backend-module-aws': major
---

Breaking change on entity output level, no code changes needed for most use cases.

Updating entities provided by DDB and Lambda providers to be of kind Resource instead of a Component.

Adding an additional EntityProvider to create entities from EC2 instances.
