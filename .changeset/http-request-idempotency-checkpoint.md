---
'@roadiehq/scaffolder-backend-module-http-request': minor
---

Add an optional `idempotencyKey` input to the `http:backstage:request` action. When set and the scaffolder supports checkpoints (experimental task recovery), the request is wrapped in a checkpoint so it is executed at most once per task — on a task restart/recovery the cached response is returned instead of re-sending the request. This makes non-idempotent requests (e.g. creating Jira tickets) safe to use in templates that enable `EXPERIMENTAL_recovery`. Behaviour is unchanged when `idempotencyKey` is omitted.
