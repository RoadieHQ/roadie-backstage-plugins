# scaffolder-frontend-module-http-request-field

This custom scaffolder field, fetches an api call from the backstage backend and allows the result to be
rendered to a list.

It can be installed as follows in the `App.tsx`

```typescript jsx
...
    <Route path="/create" element={<ScaffolderPage />}>
      <ScaffolderFieldExtensions>
        ...
        <SelectFieldFromApiExtension />
      </ScaffolderFieldExtensions>
    </Route>
...
```

Here is an example of its use in a template:

```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: custom-field-demo
  title: Custom Field Demo
  description: Custom Field Demo.
spec:
  owner: backstage/techdocs-core
  type: service

  parameters:
    properties:
    - title: Custom
      properties:
        custom:
          title: custom
          type: string
          description: My custom name for the component
          ui:field: SelectFieldFromApi
          ui:path: "catalog/entity-facets"
          ui:arraySelector: ['facets', 'kind']
          ui:valueSelector: 'count'
          ui:labelSelector: 'value'
          ui:params:
            facet: "kind"
```
