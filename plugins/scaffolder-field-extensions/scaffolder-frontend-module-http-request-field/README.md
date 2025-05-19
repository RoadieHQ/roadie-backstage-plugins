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
            type: string
            # Use `SelectFieldFromApi` to configure the select field for the entry.
            ui:field: SelectFieldFromApi

            ui:options:
              title: My Dropdown title
              description: My custom description for the component

              # The Path on the Backstage API and the parameters to fetch the data for the dropdown
              path: 'catalog/entity-facets'
              params:
                facet: 'kind'

              # (Optional) Renders the provided text as a placeholder value into the select box.
              placeholder: 'Select from options'

              # This selects the array element from the API fetch response. It finds the array with the name kind
              # under the facets object
              arraySelector: 'facets.kind'

              # (Optional) This selects the field in the array to use for the value of each select item. If its not specified
              # it will use the value of the item directly.
              valueSelector: 'count'
              # (Optional) This selects the field in the array to use for the label of each select item.
              labelSelector: 'value'
              # (Optional) This sets the delimiter used when multiple labels are selected.
              labelDelimiter: 'value'
```

The configuration above will result in an outgoing request to: `https://my.backstage.com/api/catalog/entity-facets?facet=kind`

The response is the following, and it will extract the `count` field as the value and `value` as the label of the dropdown.

```json
{
  "facets": {
    "kind": [
      {
        "count": 5,
        "value": "foo"
      }
    ]
  }
}
```

The example template would result in the following dropdown:

![Alt text](images/dropdown_sample_closed.png?raw=true 'Example of the custom scaffolder field')
![Alt text](images/dropdown_sample_opened.png?raw=true 'Example of the custom scaffolder field')

You also have the running user frontend context available for you in case there is a need to template the URL string based on the user. The underlying functionality uses nunjucks to handle templating and supports _some_ filters that are available within the library. You can find the current user information from context using the template `{{ identity }}`. The items available within the identity object can be found from the [Backstage GitHub repository](https://github.com/backstage/backstage/blob/master/packages/core-plugin-api/src/apis/definitions/auth.ts#L199).

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).
