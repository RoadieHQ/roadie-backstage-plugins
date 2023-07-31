# @roadiehq/scaffolder-backend-module-utils

## 1.10.1

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 1.10.0

### Minor Changes

- 5bcc1b11: Enable dry runs for jsonata action which supports it without modification

### Patch Changes

- 74b37636: support object result in jsonata actions
- c1f55273: Adds error handling for the `JSONata` scaffolder action.

## 1.9.0

### Minor Changes

- 8d0a7db3: Add new scaffolder action roadiehq:utils:fs:replace to add ability to replace text in files.

## 1.8.10

### Patch Changes

- 060e3b22: Minor documentation changes to JSONata actions for spelling and consistency wrt capitalization and punctuation
- ec38b255: correct jsonata action tests' descriptions

## 1.8.9

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 1.8.8

### Patch Changes

- 608e1061: Release all

## 1.8.7

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 1.8.6

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 1.8.5

### Patch Changes

- 12a139f6: Added most yaml.dump options to serialize, merge, and jsonata actions

## 1.8.4

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 1.8.3

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 1.8.2

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 1.8.1

### Patch Changes

- 1599cf96: release dependabot PRs

## 1.8.0

### Minor Changes

- 6acba5ac: Enable dry runs for actions which support it without modification

## 1.7.2

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 1.7.1

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 1.7.0

### Minor Changes

- 67ea499f: Allow `roadiehq:utils:jsonata` action to process any type.

## 1.6.1

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 1.6.0

### Minor Changes

- 31bc03b3: Release new scaffolder task actions for parsing and editing `yaml` and `json` data.

## 1.5.1

### Patch Changes

- 1522d272: Adds a few new action steps to the scaffolder `utils` package:

  - `roadiehq:utils:fs:parse` - reads a file from the workspace and parses it using `yaml` or `json` parsers.
  - `roadiehq:utils:jsonata` - allows JSONata expressions to be applied to an object to transform or query data.
  - `roadiehq:utils:jsonata:json:transform` - allows JSONata expressions to be applied to a file content to transform or query data and optionally write the output to a file.
  - `roadiehq:utils:jsonata:yaml:transform` - allows JSONata expressions to be applied to a file content to transform or query data and optionally write the output to a file.
  - `roadiehq:utils:serialize:yaml` - allows an object to be serialized into yaml
  - `roadiehq:utils:serialize:json` - allows an object to be serialized into json

## 1.5.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 1.4.0

### Minor Changes

- 1869b466: Allow merge actions to accept string

## 1.3.1

### Patch Changes

- eaa0bb2: update dependencies

## 1.3.0

### Minor Changes

- 47d42d1: Export merge action

## 1.2.0

### Minor Changes

- 16ef290: Add merge action

## 1.1.1

### Patch Changes

- 933a028: Pretty print the json merge result to the file.

## 1.1.0

### Minor Changes

- 9890756: Add a new merge json Action to the scaffolder utils actions.

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 1.0.4

### Patch Changes

- c9cfaad: Release all plugins after fixing typescript exports issue.

## 1.0.3

### Patch Changes

- 86eca6a: Update dependencies

## 1.0.2

### Patch Changes

- 55c9711: update depdendencies

## 1.0.1

### Patch Changes

- 6b4cc16: Update dependencies
  Add package information to the package.jsons, to tell the backstage cli how to run the tests

## 1.0.0

### Major Changes

- df841f0: Update dependecies to follow latest upstream version. Removed deprecated props of type 'Entity' passed into components as it is grabbed from context instead.

## 0.2.0

### Minor Changes

- f0421b4: Bumped to the latest upstream packages versions

## 0.1.4

### Patch Changes

- f5cd7e4: Update dependencies to latest Backstage packages

## 0.1.3

### Patch Changes

- 46b19a3: Update dependencies

## 0.1.2

### Patch Changes

- c779d9e: Publish new scaffolder-backend-module-utils package
- c779d9e: Update dependencies

## 0.1.1

### Patch Changes

- 7da7bfe: Update dependencies
- 95c9c1b: Publish new scaffolder-backend-module-utils package
