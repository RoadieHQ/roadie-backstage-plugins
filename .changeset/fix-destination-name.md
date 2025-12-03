---
'@roadiehq/backstage-plugin-argo-cd': patch
---

Fix Destination Server field to display destination.name when destination.server is not available.
ArgoCD allows applications to be configured with either destination.server (Kubernetes API URL)
or destination.name (cluster name reference). This change adds fallback logic to show the cluster
name when the server URL is not present, ensuring the Destination Server field displays properly
for modern ArgoCD configurations.
