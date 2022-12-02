---
'@roadiehq/scaffolder-backend-module-utils': patch
---

Adds a few new action steps to the scaffolder `utils` package:

- `roadiehq:utils:fs:parse` - reads a file from the workspace and parses it using `yaml` or `json` parsers.
- `roadiehq:utils:jsonata` - allows JSONata expressions to be applied to an object to transform or query data.
- `roadiehq:utils:serialize:yaml` - allows an object to be serialized into yaml
- `roadiehq:utils:serialize:json` - allows an object to be serialized into json
