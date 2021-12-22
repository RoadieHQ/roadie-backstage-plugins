# @roadiehq/backstage-plugin-github-insights

## 1.3.4

### Patch Changes

- 773692a: Change default port of backend from 7000 to 7007.

  This is due to the AirPlay Receiver process occupying port 7000 and preventing local Backstage instances on MacOS to start.

## 1.3.3

### Patch Changes

- 2a2b49f: Using 'backstage.io/source-location' annotation instead of default ('backstage/managed-by-location) into account if it is noted in config file.

## 1.3.2

### Patch Changes

- 4d426f9: Updated dependencies to follow latest Backstage release

## 1.3.1

### Patch Changes

- 3f280ef: Updated 'msw' package version in order to correctly run tests.
