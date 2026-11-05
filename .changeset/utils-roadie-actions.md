---
'@roadiehq/scaffolder-backend-module-utils': minor
---

Add scaffolder actions previously maintained internally by Roadie, all registered by the module: `fs:append`, `fs:read`, `fs:exists`, `workspace:template`, `workspace:template:file`, `fetch:template:plus`, `fetch:template:debug`, `catalog:register-multiple`, `gitlab:repo:commit`, `gitlab:repo:protect` and `publish:github:pull-request:debug`.

The module now depends on the `rootConfig`, `logger` and `urlReader` core services and on the catalog service.

The `workspace:*` and `fetch:template:*` actions render templates with `nunjitsu`, the same sandboxed engine as the upstream scaffolder.
