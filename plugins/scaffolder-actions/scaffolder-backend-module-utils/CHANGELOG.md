# @roadiehq/scaffolder-backend-module-utils

## 4.1.1

### Patch Changes

- 73ec5b0: Replaces use of logger from `@backstage/backend-common` in tests with new `mockServices`.

## 4.1.0

### Minor Changes

- c2274f9: Upgrade backstage version to `1.44.2`.

## 4.0.4

### Patch Changes

- 3ff52f3: Add null check to ignore block comments in yaml merges

## 4.0.3

### Patch Changes

- 2704797: Revert role back to "backend-plugin-module"

## 4.0.2

### Patch Changes

- d8cedb1: Fix utils:merge action bug on merging empty arrays with preserveComments

## 4.0.1

### Patch Changes

- eab471e: Updated the `backstage.pluginId` to match the `pluginId` set in the `createBackendModule`

## 4.0.0

### Major Changes

- f358485: Fix merge to replace entire array when mergeArrays is false or undefined

## 3.6.0

### Minor Changes

- f215405: Upgrade to 1.40.2

## 3.5.0

### Minor Changes

- 1577b80: Add configuration option to fsreplace action to allow optionally to include dotfiles when globbing for files

## 3.4.2

### Patch Changes

- e7e0b71: Upgraded `mock-fs` to latest version which supports Node `v20`+

## 3.4.1

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.

## 3.4.0

### Minor Changes

- 5463d71: Add support for wildcards in roadiehq:utils:fs:replace

## 3.3.0

### Minor Changes

- e9c26c6: Update scaffolder packages, tidy up some imports

## 3.2.0

### Minor Changes

- dc75951: add support to handle multiple documents in yaml file

## 3.1.0

### Minor Changes

- a61209b: Compatibility with Backstage 1.33+

## 3.0.1

### Patch Changes

- e85a28b: Remove import of scaffolder backend plugin.

## 3.0.0

### Major Changes

- 904ba81: Deprecated the exports from `new-backend.ts` and re-export from `index.ts` as part of the transition to the new backend system

## 2.0.2

### Patch Changes

- 2718d81: Add link to Roadie in README

## 2.0.1

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata

## 2.0.0

### Major Changes

- ca608a7: Update yaml options schema for 'yaml' package

## 1.17.1

### Patch Changes

- 9ab0cc1: fix roadiehq:utils:fs:parse example on README.md file

## 1.17.0

### Minor Changes

- daed08e: add preserveYamlComments input for roadiehq:utils:merge action

## 1.16.0

### Minor Changes

- b24d71c: Support regular expression substitution with roadiehq:utils:fs:replace

## 1.15.4

### Patch Changes

- a3b1a41: Add dry run support for fs:append action

## 1.15.3

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5

## 1.15.2

### Patch Changes

- e171728: Upgrade `jsonata` dependency.

## 1.15.1

### Patch Changes

- 005f979: Update README and entry point for scaffolder utils and http request actions.

## 1.15.0

### Minor Changes

- 99a5d90: Update to new backend system

## 1.14.1

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

## 1.14.0

### Minor Changes

- 35c787d: This makes the write file utility action to prettify the json is the input is json.

## 1.13.7

### Patch Changes

- f2e39a0: Backstage version bump to 1.23.4

## 1.13.6

### Patch Changes

- 23195a8: Version bump to backstage 1.23.3

## 1.13.5

### Patch Changes

- 6d5e4bf: Release all of the packages

## 1.13.4

### Patch Changes

- aef7096: Fix failed release

## 1.13.3

### Patch Changes

- f7287ee: Bump to backstage@1.21.1

## 1.13.2

### Patch Changes

- 3d55eb2f: Swapping 'js-yaml' library for 'yaml'

## 1.13.1

### Patch Changes

- 26bd3e42: Fix `loadAll` documentation for yaml JSONata transformer action.

## 1.13.0

### Minor Changes

- 70af2a36: Add ability to load multi-yaml files using the yaml JSONata transformer.

## 1.12.1

### Patch Changes

- 276be989: Fix version of detect-indent to 6.1.0 to avoid ESM/CommonJS issues.

## 1.12.0

### Minor Changes

- c9530c12: Allow option for JSON output files after merging to match the input file indentation

## 1.11.0

### Minor Changes

- ff63486f: Add merge array value option

## 1.10.6

### Patch Changes

- 87f90089: Version bump to Backstage 1.20.3

## 1.10.5

### Patch Changes

- 9bb000a6: Version bump to Backstage 1.19.6

## 1.10.4

### Patch Changes

- c6b0af08: Bump plugins version to backstage version 1.18.3

## 1.10.3

### Patch Changes

- 2fbcbee1: Bump to Backstage version 1.17.5

## 1.10.2

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

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
