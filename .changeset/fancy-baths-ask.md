---
'@roadiehq/backstage-plugin-prometheus': patch
---

Replace native fetch() with Backstage fetchApi in PrometheusApi to attach auth credentials to proxy requests. Fixes 401 Unauthorized errors when using the plugin with Backstage 1.24+ where backend auth is required by default.
