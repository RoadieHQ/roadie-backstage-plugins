# Backstage entity validator

This package can be used as a GitHub action or a standalone node.js module

## GitHub action

### Inputs

#### `path`

**Optional** Path to the catalog-info.yaml file to validate. Defaults to `catalog-info.yaml` at the root of the repository. It also can be a glob like `services/*/catalog-info.yaml` or a list of files seperated by comma `users.yaml,orgs/company.yaml`.

#### `verbose`

**Optional** Specify whether the output should be verbose. Default `true`.

### Outputs

None. Prints out the validated YAML on success. Prints out errors on invalid YAML

### Example usage
```
- uses:  RoadieHQ/backstage-entity-validator@v0.3.5
  with:
    path: 'catalog-info-1.yaml'
```

```
- uses:  RoadieHQ/backstage-entity-validator@v0.3.5
  with:
    path: 'catalog-info-1.yaml,catalog-info-2.yaml,catalog-info-3.yaml'
```

```
- uses:  RoadieHQ/backstage-entity-validator@v0.3.5
  with:
    path: 'catalog-info-*.yaml,services/**/*/catalog-info.yaml'
```

## CircleCI Orb

### Inputs

#### `path`

**Optional** Path to the catalog-info.yaml file to validate. Defaults to `catalog-info.yaml` at the root of the repository.

### Outputs

None. Prints out the validated YAML on success. Prints out errors on invalid YAML

### Example config
```
description: >
  Sample catalog-info.yaml validation
usage:
  version: 2.1
  orbs:
    entity-validator: "roadiehq/backstage-entity-validator@0.3.0"
  workflows:
    use-entity-validator:
      jobs:
        - entity-validator/validate:
            path: catalog-info.yaml
```


## Using the CLI

### Usage

```
Usage: validate-entity [OPTION] [FILE]

Validates Backstage entity definition files.  Files may be specified as
arguments or via STDIN, one per line.

OPTION:
-h  display help
-q  minimal output while validating entities
-i  validate files provided over standard input
```

Examples:

```
# in a shell

# validate all entities contained in the "catalog" and subfolders
validate-entity catalog/**/*.yaml

# list of files produced by a script to validate
find-relevant-yaml-files.sh | validate-entity -i 
```

### Installing and running

#### As a global tool

```
# install
npm install --global @roadiehq/backstage-entity-validator

# run
validate-entity file1.yaml file2.yaml
```
#### In an existing node project

```
# install
npm install --save-dev @roadiehq/backstage-entity-validator

# run
npx validate-entity file1.yaml file2.yaml
```

#### When working on this tool

```
# install
npm install

# run
npm run validate file1.yaml file2.yaml

# or
bin/bev file1.yaml file2.yaml
```
