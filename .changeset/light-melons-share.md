---
'@roadiehq/backstage-plugin-prometheus': minor
---

Users can now define a new annotation, `prometheus.io/labels`. This annotation defines which labels will be included in the displayed table; if the annotation is not applied, the result is just filtered using `prometheus.io/alert` annotation. Example of usage:

```
prometheus.io/labels: "label1=value1,label2=value2"
```

This change modifies `useAlerts`, which adds filtering of alerts and adds a definition of new annotation. It also creates tests that verify this functionality.
