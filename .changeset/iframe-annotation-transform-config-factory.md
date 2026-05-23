---
'@roadiehq/backstage-plugin-iframe': minor
---

Add the `wrapAnnotationFromConfig(config, configKey, suffix?)` helper — a
factory variant of `wrapAnnotation` that reads the URL prefix from a
frontend-visible config key at call time. Useful when the iframe host
should vary per environment (dev/staging/prod) without recompiling. Call
it from a component that has `useApi(configApiRef)` available and pass
the resulting transform to `EntityIFrameCard`. The configured key must be
declared with `@visibility: frontend` in `config.d.ts` so the value
reaches the browser bundle.
