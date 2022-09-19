---
'@roadiehq/backstage-plugin-argo-cd-backend': patch
---

1. Get Application App Data has a changed thrown error message. 2) Failing on a wider spectrum of error messages when deleting projects. If you were expecting a false when the project failed to delete for these other possible reasons, now the function will throw for those other possible reasons. 3) Logging thrown errors for the endpoints that create an argo configuration, or delete an argo configuration. 4) Added unit tests.
