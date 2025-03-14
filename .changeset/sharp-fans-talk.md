---
'@roadiehq/backstage-plugin-prometheus': major
---

Customisation improvements:

- Add `extraColumns` prop to `EntityPrometheusAlertCard` & `EntityPrometheusContent`
- Add `showAnnotations` prop to `EntityPrometheusAlertCard` & `EntityPrometheusContent`
- Add `showLabels` prop to `EntityPrometheusAlertCard` & `EntityPrometheusContent`

Fixes:

- Fix #1823 to support multiple instances of Prometheus.
- Move import of `MissingAnnotationEmptyState` to `@backstage/plugin-catalog-react` to clear deprecation warning.
