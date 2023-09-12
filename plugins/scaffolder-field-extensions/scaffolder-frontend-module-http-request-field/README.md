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

              # (Optional) The Path on the Backstage API and the parameters to fetch the data for the dropdown
              path: 'catalog/entity-facets'
              # (Optional) Specifies the key for the query param that appends the path i.e. `/catalog/entity-facets?facet=kind
              params:
                facet: 'kind'
              # (Optional) Selects the array from the API response to use for populating the values of the select.
              # It finds the array with the name kind under the facets object
              arraySelector: 'facets.kind'
              # (Optional) Selects from an object in the response body array the value to use for each select item.
              # If your array is a list of strings or numbers you can leave this out and it will use the values directly.
              valueSelector: 'count'
              # (Optional) Selects from an object in the response body array the value to use for the label of each select item.
              # If your array is a list of strings or numbers you can leave this out and it will use the values directly.
              # If left out it will use the select values as the labels.
              labelSelector: 'value'
```

The configuration above will result in an outgoing request to: `http://loclhost:7007/api/catalog/entity-facets?facet=kind`

The response is the following and it will extract the `count` field as the value and `value` as the label of the dropdown.

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

The simplest version of this parameter would look like this:

````yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: http-param-example
spec:
  owner: roadie
  type: service
  parameters:
    properties:
      custom-basic:
        type: string
        ui:field: SelectFieldFromApi
        ui:options:
          path: 'catalog/entities'
          # This assumes the api response returns an array of objects of ```{ metadata: { name: "", ... }, ... }```
          valueSelector: 'metadata.name'
````

[jsonata](https://docs.jsonata.org/overview.html) can also be used to select the values for the dropdown from the API response like so:

````yaml
---
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: http-param-example
spec:
  owner: roadie
  type: service
  parameters:
    properties:
      custom-jsonata:
        type: string
        ui:field: SelectFieldFromApi
        ui:options:
          path: 'catalog/entities'
          # This assumes the api response returns an array of objects of ```{ metadata: { name: "", ... }, ... }```
          jsonataExpression: 'metadata.name'
````

### Dynamic Select

You can configure your http select to toggle between different requests in order to populate the dropdown depending on previously selected parameters.

There are several ways to do this. The simplest looks like so:

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
      facetValue:
        type: string
        enum: ['kind', 'apiVersion']
      custom:
        type: string
        # Use `SelectFieldFromApi` to configure the select field for the entry.
        ui:field: SelectFieldFromApi

        ui:options:
          title: My Dropdown title
          description: My custom description for the component
          # (Optional) The Path on the Backstage API and the parameters to fetch the data for the dropdown
          path: 'catalog/entity-facets'
          # (Optional) Selects the array from the API response to use for populating the values of the select.
          # It finds the array with the name kind under the facets object
          arraySelector: 'facets.kind'
          # (Optional) Selects the field in the array to use for the value of each select item. If its not specified
          # it will use the value of the item directly.
          valueSelector: 'count'
          # (Optional) Selects the field in the array to use for the label of each select item.
          labelSelector: 'value'
          # (Optional)
          dynamicParams:
            # (Optional) The key of a previous template property in this form who's selected value will be used as the query parameter value on the request
            paramValueLocation: 'facetValue'
```

The configuration above will result in an outgoing request to: `http://localhost:7007/api/catalog/entity-facets?facet=kind`
when the 'kind' facet is selected and `http://localhost:7007/api/catalog/entity-facets?facet=apiVersion` when 'apiVersion' is selected.

### Response Parsing Using Jsonata

You can map between different response parsing using [jsonata](https://docs.jsonata.org/overview.html) rather than the `arraySelector` and `valueSelector` like so:

```yaml
properties:
  facetMapping:
    title: 'Facet Mapping'
    enumNames:
      - 'Kind'
      - 'Entity name'
    enum:
      - facet: 'kind'
        paramKey: 'facet'
        jsonata: 'facets.kind.value'
      - facet: 'metadata.name'
        paramKey: 'facet'
        jsonata: 'facets.`metadata.name`.value'
  custom:
    type: string
    ui:field: SelectFieldFromApi
    ui:options:
      title: Select Populated Depending on Previous field
      # The Path to the Backstage API
      path: 'catalog/entity-facets'
      # (Optional)
      dynamicParams:
        # (Optional) The key of a previous template property who's selected value will be used as an additional query parameter value on the request
        # i.e. '?facet=' or '?filter=kind=' depending on whether `Kind` or `Group name` is selected.
        paramKeyLocation: 'objectFacet.paramKey'
        # (Optional) The key of a previous template property in this form who's selected value will be used as the query parameter value on the request
        paramValueLocation: 'facetMapping'
        # (Optional) The path to a previous template property for the jsonata string that will be used to parse the request's body and extract values.
        # i.e. 'facets.kind.value' or 'facets.`metadata.name`.value' depending on whether `Kind` or `Entity name` is selected.
        jsonataLocation: 'facetMapping.jsonata'
```

When the first enum value is selected, this will produce a request for example to `https://localhost:7007/api/catalog/entity-facets?facet=kind` and use 'facets.kind.value' jsonata to get a list of values from the response body.
Or when the second enum is selected, a request to `https://localhost:7007/api/catalog/entity-facets?facet=metadata.name` using 'facets.`metadata.name`.value' jsonata.

### Using different endpoints

If you want to selectively call different api endpoints you can do so as follows:

```yaml
properties:
  objectFacet:
    title: 'Select Mapping'
    enumNames:
      - 'Kind'
      - 'Group Name'
    enum:
      - paramValue: 'kind'
        paramKey: 'facet'
        path: 'catalog/entity-facets'
        jsonata: 'facets.kind.value'
      - paramValue: 'group'
        paramKey: 'filter=kind'
        path: 'catalog/entities'
        jsonata: 'metadata.name'
  entities:
    type: string
    ui:field: SelectFieldFromApi
    ui:options:
      title: Dependant select
      dynamicParams:
        # (Optional) The key of a previous template property who's selected value will be used as an additional query parameter value on the request
        # i.e. '?facet=' or '?filter=kind=' depending on whether `Kind` or `Group name` is selected.
        paramKeyLocation: 'objectFacet.paramKey'
        # (Optional) The key of a previous template property in this form who's selected value will be used as the query parameter value on the request
        paramValueLocation: 'objectFacet.paramValue'
        # (Optional) The path to a previous template property for the HTTP request path added to the backend api base url.
        # i.e. 'http://localhost:7007/api/catalog/entity-facets' or 'http://localhost:7007/api/catalog/entities' depending on whether `Kind` or `Group name` is selected.
        pathLocation: 'objectFacet.path'
        # (Optional) The path to a previous template property for the jsonata string that will be used to parse the request's body and extract values.
        # i.e. 'facets.kind.value' or 'facets.`metadata.name`.value' depending on whether `Kind` or `Entity name` is selected.
        jsonataLocation: 'objectFacet.jsonata'
```
