---
'@roadiehq/backstage-plugin-jira': patch
---

Upgrade `html-react-parser` from `^0.14.1` to `^6.1.8`. The `DomElement` type was removed upstream, so the activity stream's link handling now uses `DOMNode`/`Element`.
