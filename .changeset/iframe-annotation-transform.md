---
'@roadiehq/backstage-plugin-iframe': minor
---

Add an optional `transform` prop for `EntityIFrameCard` / `IFrameCard` when
using `srcFromAnnotation`. The function receives the raw annotation value
plus the entity and returns the final iframe `src`, so annotations can
store a bare identifier (e.g. a dashboard id) instead of a full URL. Two
helper builders are exported: `wrapAnnotation(prefix, suffix?)` for
prefix/suffix wrapping and `intoTemplate('https://host/foo/${value}/extra')`
for embedding the value as a substring. The transformed URL still goes
through the existing https-only and `iframe.allowList` checks.
