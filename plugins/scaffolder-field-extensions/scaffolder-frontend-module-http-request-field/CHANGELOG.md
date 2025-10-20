# @roadiehq/plugin-scaffolder-frontend-module-http-request-field

## 2.2.1

### Patch Changes

- 33ac44d: Add NFS metadata to package.json

## 2.2.0

### Minor Changes

- f215405: Upgrade to 1.40.2

## 2.1.0

### Minor Changes

- c4fe549: Add the ability to set a template string for use as the dropdown item label.

## 2.0.1

### Patch Changes

- 145dde6: Modify display labels to be sorted alphabetically ignoring the case.

## 2.0.0

### Major Changes

- 59c552a: Adds validation of the response code. By default it will ensure its within the 200 range. Otherwise it will fail.

## 1.8.2

### Patch Changes

- dcf952a: Set the value in the http request field if provided in the formData.

## 1.8.1

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.

## 1.8.0

### Minor Changes

- adf79be: Add schema for SelectFieldFromApi so it is visible in custom fields playground

## 1.7.2

### Patch Changes

- 2718d81: Add link to Roadie in README

## 1.7.1

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata

## 1.7.0

### Minor Changes

- 030b57f: Update SelectFieldFromApi to support multiple select

  If the field has type "array" then use multiple select.

## 1.6.13

### Patch Changes

- 4710888: Relax validation on params to allow an array of key-value pairs to be used as query params. Expands the usage to support params with duplicate keys.

## 1.6.12

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5

## 2.0.0

### Patch Changes

- 32025b8: Fix validation for array in SelectFieldFromApi component

## 1.6.10

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

## 1.6.9

### Patch Changes

- 8d116b7: Allow unsetting the selected value

## 1.6.8

### Patch Changes

- a63a344: Modify identity injection to be done before rendering the field to avoid intermittent state issues.

## 1.6.7

### Patch Changes

- 5c76e25: Add possibility to use identity within the HTTP Request Field Scaffolder Field Extension

## 1.6.6

### Patch Changes

- 23195a8: Version bump to backstage 1.23.3

## 1.6.5

### Patch Changes

- 6d5e4bf: Release all of the packages

## 1.6.4

### Patch Changes

- aef7096: Fix failed release

## 1.6.3

### Patch Changes

- f7287ee: Bump to backstage@1.21.1
- 84f7e01: Bump dependencies to match

## 1.6.2

### Patch Changes

- 87f90089: Version bump to Backstage 1.20.3

## 1.6.1

### Patch Changes

- 9bb000a6: Version bump to Backstage 1.19.6

## 1.6.0

### Minor Changes

- dacf31c1: Allow SelectFieldFromApi to use OAuth

## 1.5.2

### Patch Changes

- c6b0af08: Bump plugins version to backstage version 1.18.3

## 1.5.1

### Patch Changes

- 14273c2d: Expose placeholder property for the select

## 1.5.0

### Minor Changes

- b338f5e3: Allow parameters to be used for the select field options.

## 1.4.2

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

## 1.4.1

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 1.4.0

### Minor Changes

- da5068ff: Remove field validation for `SelectFieldFromApi`. The validation didn't make sense and was needlessly limiting.

## 1.3.13

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 1.3.12

### Patch Changes

- 608e1061: Release all

## 1.3.11

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 1.3.10

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 1.3.9

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 1.3.8

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 1.3.7

### Patch Changes

- a36acc83: Add possibility to define title and description for the http request custom field dropdown box.

## 1.3.6

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 1.3.5

### Patch Changes

- 1599cf96: release dependabot PRs

## 1.3.4

### Patch Changes

- 3a870726: Bump the `msw` dependency to `^1.0.1`

## 1.3.3

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 1.3.2

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 1.3.1

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 1.3.0

### Minor Changes

- 1037eeae: Add title and description options to field selector

## 1.2.0

### Minor Changes

- 4251d8de: Make array selector optional for SelectFieldFromApi

  Where the array selector is not supplied return the response as is.
  The motivation here is to support response which are already a array.

## 1.1.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 1.0.1

### Patch Changes

- eaa0bb2: update dependencies

## 1.0.0

### Major Changes

- be08184: Move parameters for the `SelectFieldFromApi` field under `ui:options`.

## 0.0.2

### Patch Changes

- f799220: Initial release of http request field plugin.
