# @roadiehq/backstage-plugin-wiz

## 2.1.0

### Minor Changes

- f215405: Upgrade to 1.40.2

## 2.0.0

### Major Changes

- ab88aee: **BREAKING** Fixed an issue with backend plugin initialisation approach which required additional configuration for the end user.

  This fix allows plugin consumers to add the backend plugin using the new backend system, unfortunately, this breaks existing approaches as plugin consumers will have customised the backend plugin to respond on the incorrect/previous URL.

  Using v2 of the frontend (backstage-plugin-wiz) plugin requires v2 of the backend (plugin-wiz-backend) plugin.

  These changes are **required** to `packages/backend/src/index.ts`

  ```diff
  + // Install wiz backend plugin
  + backend.add(import('@roadiehq/plugin-wiz-backend'));
  - import wiz from './plugins/wiz';
  - // ...
  - async function main() {
  -   // ...
  -   const wizEnv = useHotMemoize(module, () => createEnv('wiz'));
  -
  -   const wizConfig = {
  -   clientId: config.getOptionalString('wiz.clientId'),
  -   clientSecret: config.getOptionalString('wiz.clientSecret'),
  -   tokenUrl: config.getOptionalString('wiz.tokenUrl'),
  -   apiUrl: config.getOptionalString('wiz.wizAPIUrl'),
  - };
  -
  -   const apiRouter = Router();
  -     if (wizConfig.enabled && wizConfig.clientId && wizConfig.clientSecret && wizConfig.tokenUrl && wizConfig.apiUrl) {
  -     router.use('/wiz-backend', await wiz(wizEnv));
  -   } await wiz(wizEnv));
  -   // ...
  - }
  ```

  And you can remove the previous plugin customisation file `packages/backend/src/plugins/wiz.ts`

## 1.0.9

### Patch Changes

- 9b66e34: Add links for issues, order by created date

## 1.0.8

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.

## 1.0.7

### Patch Changes

- 07e34ae: Handle missing parameters message, remove uneeded config property. Improve description in WIZ graphs

## 1.0.6

### Patch Changes

- e890aae: Add Context to minimize number of API calls and return 500 results instead of 100

## 1.0.4

### Patch Changes

- 5f87295: Add assets folder to dist

## 1.0.3

### Patch Changes

- 85b43f7: Added WIZ logo to components, improved error response

## 1.0.2

### Patch Changes

- 7afd136: Publish backend plugin and add repository in order to display images

## 1.0.1

### Patch Changes

- e93fba4: Added pluginId in package.json

## 1.0.0

### Major Changes

- 0da30b3: Open source and release WIZ Backstage Plugin

  - Added WIZ backend plugin for handling retriving and refreshing token based on client secret and client id
  - Includes issues preview for a project, grouped by Control.
  - Adds widgets for open and resolved issues severity preview, graphs for open and resolved issues, and severity over time
