---
'@roadiehq/backstage-plugin-prometheus': minor
---

Users can now add a callback to an `EntityPrometheusAlertCard` component. The component with callback can look like this:

```typescript
<EntityPrometheusAlertCard onRowClick={callbackFunction} />
```

And `callbackFunction` can have the following definition:

```typescript
const callbackFunction = (arg: Alerts) => {
  ...
};
```

Where the `Alerts` type is a user-defined type to more easily parse JSON definition (`any` type can also be used). This callback is optional; if not supplied, tables in the row are not clickable.

This change modifies `PrometheusAlertStatus`, which adds `onRowClick` event to a `Table` component.
