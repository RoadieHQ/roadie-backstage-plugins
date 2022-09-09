# scaffolder-frontend-module-http-request-field

This custom scaffolder field, fetches an api call from the backstage backend and allows the result to be
rendered to a list.

![Alt text](images/sample.png?raw=true 'Example of the custom scaffolder field')

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

            # Use `SelectFieldFromApi` to configure the select field for the entry.
            ui:field: SelectFieldFromApi

            # The Path on the Backstage API and the parameters to fetch the data for the dropdown
            ui:path: 'catalog/entity-facets'
            ui:params:
              facet: 'kind'

            # This selects the array element from the API fetch response. It finds the array with the name kind
            # under the facets object
            ui:arraySelector: 'facets.kind'

            # This selects the field in the array to use for the value of each select item.
            ui:valueSelector: 'count'
            # (Optional) This selects the field in the array to use for the label of each select item.
            ui:labelSelector: 'value'
```
