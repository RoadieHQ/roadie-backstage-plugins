# @roadiehq/backstage-plugin-argo-cd-backend

## 4.6.0

### Minor Changes

- a1dcd5a: Support prefixes for argoCD instances on backstage-plugin-argo-cd-backend

## 4.5.1

### Patch Changes

- 7cda430: Match the instance name from findArgoApp results with the actual configured instance from this.instanceConfigs before calling getArgoToken():

## 4.5.0

### Minor Changes

- c2274f9: Upgrade backstage version to `1.44.2`.

## 4.4.2

### Patch Changes

- 534fbbc: Use test-utils from backstage bundle.
- 4812498: Fixed the error that occurred when the provided Argo CD URL contained trailing slash

## 4.4.1

### Patch Changes

- 71a59f7: added `fromConfig` static constructor method

## 4.4.0

### Minor Changes

- f215405: Upgrade to 1.40.2

## 4.3.1

### Patch Changes

- 296cca7: Remove deprecated `@backstage/backend-common` from dependencies.

## 4.3.0

### Minor Changes

- 8548407: ## 🚀 New Feature:

  You can now use azure active directory (Microsoft Entra ID) to authentication to Argo CD instances!

  **Login Priorities** (We will prioritize logins as follows):

  1. Instance Level Tokens

     ```yml
     argocd:
       appLocatorMethods:
         - type: config
           instances:
             - name: argoInstance1
               url: https://argoInstance1.com
               token: ${ARGOCD_AUTH_TOKEN} # Instance Level Token
     ```

  2. Instance Level Username and Password

     ```yml
     argocd:
       appLocatorMethods:
         - type: config
           instances:
             - name: argoInstance1
               url: https://argoInstance1.com
               # Instance Level Username and Password
               username: ${ARGOCD_USERNAME_INSTANCE_2}
               password: ${ARGOCD_PASSWORD_INSTANCE_2}
     ```

  3. Upper Level Username and Password

     ```yml
     argocd:
       # Upper Level Username and Password
       username: ${ARGOCD_USERNAME}
       password: ${ARGOCD_PASSWORD}
       appLocatorMethods:
         - type: config
           instances:
             - name: argoInstance1
               url: https://argoInstance1.com
     ```

  4. Azure Credentials using azure login url

  ```yml
  argocd:
    # Upper Level Argo OIDC Config using Azure signals to use azure for logging in purposes, if no other login options available.
    oidcConfig:
      provider: azure # currently only the term azure is supported
      providerConfigKey: <anyConfigKey> # this is where your azure config is found. You may provide any key here so long as it's found in your config.
    appLocatorMethods:
      - type: config
        instances:
          - name: argoInstance1
            url: https://argoInstance1.com
  ```

  ```yml
  azure: # azure config must have these fields below (key for where the config is found can vary).
    tenantId: ${AZURE_TENANT_ID}
    clientId: ${AZURE_CLIENT_ID}
    clientSecret: ${AZURE_CLIENT_SECRET}
    loginUrl: https://login.microsoftonline.com
  ```

  For more information on how to configure your argo cd instances to recieve login requests using Azure Active Directory (Microsoft Entra ID), please read the plugin's read me.

## 4.2.0

### Minor Changes

- 84e87f6: Removed requirement for external service factory include

## 4.1.0

### Minor Changes

- b156e17: Add sourceIndex query parameter for fetching revision metadata.

## 4.0.1

### Patch Changes

- a83e7e9: Tidy unused plugin depdendencies.

## 4.0.0

### Major Changes

- 58b87ce: Fix: No longer expecting winston logger types for router. This may cause type errors in development.

  BREAKING CHANGE:

  We have extracted the argo cd service into its own service factory/reference. The change was made to enable dependency injection of the argocd service into the router. Dependency injection helps with testing the functionality of the code more easily. Service factories also have several checks that backstage validates at startup - like those that prevent circular depednencies, and validation on dependencies missing.

  This is a breaking change because if you are using the new backend system, you will need to now import the argocd service in your `backend/index.ts` file like this:

  ```typescript
  import { argocdServiceFactory } from '@roadiehq/backstage-plugin-argo-cd-backend';

  backend.add(argocdServiceFactory); // NEW!! Import Service Factory
  backend.add(import('@roadiehq/backstage-plugin-argo-cd-backend/alpha')); // Import Plugin
  ```

  If you are using the legacy backend service, then you will have to create the router passing in the argo cd service, which is already made available:

  ```typescript
  export default async function createPlugin({
    logger,
    config,
  }: PluginEnvironment) {
    console.log('ArgoCD plugin is initializing');
    const argoUserName =
      config.getOptionalString('argocd.username') ?? 'argocdUsername';
    const argoPassword =
      config.getOptionalString('argocd.password') ?? 'argocdPassword';
    return createRouter({
      logger,
      config,
      argocdService: new ArgoService(
        argoUserName,
        argoPassword,
        config,
        logger,
      ), // you must now pass the argo service
    });
  }
  ```

## 3.3.2

### Patch Changes

- eb5a107: removing old way of starting app locally, to new way of starting app locally.

## 3.3.1

### Patch Changes

- 2bf0fa2: Adding the `resources-finalizer.argocd.argoproj.io` finalizer when creating a project. This allows the ability to delete the project first without getting stuck when deleting the application afterwards. This fix will allow the application to delete and not get stuck deleting.

## 3.3.0

### Minor Changes

- 8915f83: We are making the logger compatible with Backstage's LoggerService and winston's Logger so that Roadie can be used with newer and older versions of Backstage.

## 3.2.3

### Patch Changes

- 6847280: added keywords to all plugins

## 3.2.2

### Patch Changes

- 2718d81: Add link to Roadie in README

## 3.2.1

### Patch Changes

- 741af3b: fix: Align pluginId metadata to id set during plugin initialization

## 3.2.0

### Minor Changes

- dc9664d: Allow setting up a separate frontend URL on multiple Ar instances for linking purposes.

## 3.1.0

### Minor Changes

- e1c21c8: Adds support for Backstage's new backend system, available via the `/alpha` sub-path export.

## 3.0.4

### Patch Changes

- d6ae6e9: Release all packages to rollout new metadata

## 3.0.3

### Patch Changes

- 5b85b8d: fix: update argo project payload to match spec for update argo project

## 3.0.2

### Patch Changes

- d02d5df: Upgrade to backstage 1.26.5

## 3.0.1

### Patch Changes

- 5afd7f4: fix: invalid media type error for argo instances that expect content type header to be provided, we added content type for each argo call.

## 3.0.0

### Major Changes

- 04b7788: #### New Feature ✨

  - **New Endpoint!**: Terminate Application Operation endpoint is a proxy to the [argocd terminate application operation functionality](https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_TerminateOperation).

    ```
    DELETE /argoInstance/:argoInstanceName/applications/:argoAppName/operation
    ```

  - **New query parameter!**: We introduced the ability to terminate your application's current operation prior to deleting the application and project. Argo applications will not delete if there is an operation in progress. We now allow the ability to terminate the current operation so that deleting can happened immediately.

    ```
    DELETE /argoInstance/:argoInstanceName/applications/:argoAppName?terminateOperation=true
    ```

  - **Wait Interval configuration flag**: Often deleting the argo application takes time - it is not always immediate. In fact, the request to delete an application is queued in argo. Consequently, an argo project cannot delete if the application is still pending deletion. To combat this, we chose to wait for the deletion of the application to complete, by doing 5 checks and waiting for 5 seconds inbetween each check, totaling for 25 seconds in waiting for the application to be deleted before attempting to delete the project. We **do not** do this anymore. Our default is to **NOT** check more than once, and allow for the wait interval between each check to be configurable. You can now configure the wait interval time (in ms). You can still configure the amount of checks. Please look at plugin's readme for more information and updates.

    ```yml
    argocd:
      waitInterval: 1000 # time in ms, optional number, default is 5000ms
      waitCycles: 2 # number of checks, optional number, default is to check 1 time with no wait time
    ```

  #### BREAKING CHANGES 💥

  - We are no longer waiting for an application to delete prior to attempting to delete a project due to the wait interval, wait cycle, and terminate operation changes. More details on these added features are in the above section. If you would like the same checking effect as before, you may adjust your `waitCycles` configuration value to be 5 (as this was the previous default check count). This affects the `DELETE /argoInstance/:argoInstanceName/applications/:argoAppName` route.

  - Response Change: The route for deleting an argocd application and project response has changed.

    `DELETE /argoInstance/:argoInstanceName/applications/:argoAppName`

    We introduced a new key (`terminateOperationDetails`) to the object that normally returns from the endpoint above, and changes to the original response names.

    Below is the type for reference. Please look at the commit to determine what the previous response was.

    ```typescript
    type ArgoErrorResponse = {
      message: string;
      error: string;
      code: number;
    };

    type DeleteResponse =
      | (ArgoErrorResponse & { statusCode: Exclude<HttpStatusCodes, 200> })
      | { statusCode: 200 };

    type status = 'pending' | 'success' | 'failed';

    type ResponseSchema<T> = {
      status: status;
      message: string;
      argoResponse: T;
    };

    type ResponseSchemaUnknown = {
      status: Extract<status, 'failed'>;
      message: string;
      argoResponse: Record<string, never>;
    };

    type DeleteApplicationAndProjectResponse = {
      terminateOperationDetails?: ResponseSchema<DeleteResponse> | undefined;
      deleteAppDetails:
        | ResponseSchema<DeleteResponse | ArgoApplication>
        | undefined;
      deleteProjectDetails:
        | ResponseSchema<DeleteResponse>
        | ResponseSchemaUnknown
        | undefined;
    };
    ```

  Please look at plugin's readme and the commit for more information on response type changes.

## 2.14.7

### Patch Changes

- 7cd4bdf: version upgrade to 1.25.0

## 2.14.6

### Patch Changes

- f2e39a0: Backstage version bump to 1.23.4

## 2.14.5

### Patch Changes

- 23195a8: Version bump to backstage 1.23.3

## 2.14.4

### Patch Changes

- c5890a8: add proper content type header to argo DELETE request on app and project

## 2.14.3

### Patch Changes

- 6d5e4bf: Release all of the packages

## 2.14.2

### Patch Changes

- aef7096: Fix failed release

## 2.14.1

### Patch Changes

- f7287ee: Bump to backstage@1.21.1

## 2.14.0

### Minor Changes

- f96282c5: Support application in any namespace.

## 2.13.0

### Minor Changes

- 7baff2ee: Lazy load revisions and allow admins to limit the numbers of revisions to load in the configuration

## 2.12.1

### Patch Changes

- 87f90089: Version bump to Backstage 1.20.3

## 2.12.0

### Minor Changes

- 1021aa09: added new endpoint to get argo application information based on the application name and argo instance.
- 50aeebf0: adds cluster and namespace resource black/white lists to argo projects

## 2.11.4

### Patch Changes

- 9bb000a6: Version bump to Backstage 1.19.6

## 2.11.3

### Patch Changes

- c6b0af08: Bump plugins version to backstage version 1.18.3

## 2.11.2

### Patch Changes

- 56c40ed5: fix bug that throws error when some argo instances are unavailable

## 2.11.1

### Patch Changes

- 0d688d09: Bump package versions to backstage version 1.17.0

## 2.11.0

### Minor Changes

- 0c7d7136: Updates the error thrown in argoCreateApplication to include the error message from argo api response.

## 2.10.0

### Minor Changes

- d52d82ec: Add endpoint that grabs all argo projects and another endpoint that checks if app already exists in a given cluster with the same repo and source

## 2.9.0

### Minor Changes

- 23ca55f3: Adding FailOnSharedResource=true to syncOptions when an argo app is created to prevent dueling argo applications

## 2.8.2

### Patch Changes

- 05c0c417: Update deps to backstage 1.16.0 version

## 2.8.1

### Patch Changes

- edf2f0ab: Update dependencies to backstage version 1.15.0

## 2.8.0

### Minor Changes

- 18f8a82f: add updateArgoApp endpoint to change source repo, path, and label values

## 2.7.8

### Patch Changes

- 608e1061: Release all

## 2.7.7

### Patch Changes

- 59179c45: Upgrade to backstage version 1.14.1

## 2.7.6

### Patch Changes

- 9dc30073: Expose instances for the frontend to display ArgoCD dashboard links in a multi instance setup.
  Additionally, don't expose secrets.

## 2.7.5

### Patch Changes

- 85620abc: Bump packages to backstage version 1.13.0

## 2.7.4

### Patch Changes

- 8ae4bbc7: ---

  '@roadiehq/backstage-plugin-argo-cd-backend': patch
  '@roadiehq/backstage-plugin-argo-cd': patch

  ***

  Added API to fetch revision information.
  Modified Argocd overview card to show error message. When there is error message, users can hover the field in the overview table to see the error message. Modified the Argocd history card to show more informations including author, message, and combine deploy detail in one column.

## 2.7.3

### Patch Changes

- e331d3a1: Bump to backstage version 1.12.1

## 2.7.2

### Patch Changes

- f129477d: Upgrade to backstage 1.12.0

## 2.7.1

### Patch Changes

- ac5717e6: Update plugins to Backstage version 1.11.1

## 2.7.0

### Minor Changes

- dbaf0f83: enhance argo delete operation to handle failures better

### Patch Changes

- 1599cf96: release dependabot PRs

## 2.6.4

### Patch Changes

- 6d186f0f: Bump plugin's version to backstage version 1.10.1

## 2.6.3

### Patch Changes

- 054d585b: Bump plugin versions to be compatible by backstage 1.9.1

## 2.6.2

### Patch Changes

- 7084d814: Bump plugins version to backstage 1.8.3

## 2.6.1

### Patch Changes

- 15af4518: Fixed using selectors to find Application across multiple ArgoCD servers

## 2.6.0

### Minor Changes

- 015aebdf: Bump plugins version to be compatible by backstage 1.7

## 2.5.3

### Patch Changes

- eaa0bb2: update dependencies

## 2.5.2

### Patch Changes

- 231f37e: Added logging to improve visibility

## 2.5.1

### Patch Changes

- e017302: 1. Get Application App Data has a changed thrown error message. 2. Failing on a wider spectrum of error messages when deleting projects. If you were expecting a false when the project failed to delete for these other possible reasons, now the function will throw for those other possible reasons. 3. Logging thrown errors for the endpoints that create an argo configuration, or delete an argo configuration. 4. Added unit tests.

## 2.5.0

### Minor Changes

- 8716dfb: Use different credentials for each instance

## 2.4.4

### Patch Changes

- 151b46b: bump to latest backstage package versions

## 2.4.3

### Patch Changes

- c9cfaad: Release all plugins after fixing typescript exports issue.

## 2.4.2

### Patch Changes

- 86eca6a: Update dependencies

## 2.4.1

### Patch Changes

- 55c9711: update depdendencies

## 2.4.0

### Minor Changes

- 16d70f0: Use `cross-fetch` instead of `axios` for rest requests.

## 2.3.0

### Minor Changes

- 9bcaa85: bug fix: read label value being passed in instead of using app name

## 2.2.0

### Minor Changes

- 4259734: fix: argocd sync wasn't being sent as an object but rather a string

## 2.1.1

### Patch Changes

- 6b4cc16: Update dependencies
  Add package information to the package.jsons, to tell the backstage cli how to run the tests

## 2.1.0

### Minor Changes

- 3ba9cb9: - Add create endpoints
  - Add delete endpoints
  - Add sync endpoints
  - Add scaffolder action for create

## 2.0.0

### Major Changes

- df841f0: Update dependecies to follow latest upstream version. Removed deprecated props of type 'Entity' passed into components as it is grabbed from context instead.

## 1.3.0

### Minor Changes

- f0421b4: Bumped to the latest upstream packages versions

## 1.2.10

### Patch Changes

- f5cd7e4: Update dependencies to latest Backstage packages

## 1.2.9

### Patch Changes

- 46b19a3: Update dependencies

## 1.2.8

### Patch Changes

- c779d9e: Update dependencies

## 1.2.7

### Patch Changes

- 7da7bfe: Update dependencies

## 1.2.6

### Patch Changes

- ee81868: Update dependencies

## 1.2.5

### Patch Changes

- 5ae1b4b: Update README.md files

## 1.2.4

### Patch Changes

- b5db653: Update dependecies to latest packages

## 1.2.3

### Patch Changes

- a02dbf5: Migrating to TestApiProvider in the tests

## 1.2.2

### Patch Changes

- 49abec7: Update patch to release new changes.

## 1.2.1

### Patch Changes

- a728fd1: Update underlying packages and release.

## 1.2.0

### Minor Changes

- ed90f25: Breaking dependency updates for @backstage/core-app-api, @backstage/test-utils, @backstage/core-plugin-api, @backstage/backend-common && @backstage/integration

## 1.1.1

### Patch Changes

- 773692a: Change default port of backend from 7000 to 7007.

  This is due to the AirPlay Receiver process occupying port 7000 and preventing local Backstage instances on MacOS to start.

## 1.1.0

### Minor Changes

- 1d256c6: Support multiple Argo instances using the app-selector annotation
