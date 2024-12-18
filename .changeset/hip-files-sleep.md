---
'@roadiehq/backstage-plugin-argo-cd-backend': patch
---

Adding the `resources-finalizer.argocd.argoproj.io` finalizer when creating a project. This allows the ability to delete the project first without getting stuck when deleting the application afterwards. This fix will allow the application to delete and not get stuck deleting.
