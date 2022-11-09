---
'@roadiehq/plugin-scaffolder-frontend-module-http-request-field': minor
---

Make array selector optional for SelectFieldFromApi

Where the array selector is not supplied return the response as is.
The motivation here is to support response which are already a array.
