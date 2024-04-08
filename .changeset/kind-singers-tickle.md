---
'@roadiehq/backstage-plugin-argo-cd-backend': major
---

#### New Feature ✨

- **New Endpoint!**: Terminate Application Operation endpoint is a proxy to the [argocd terminate application operation functionality](https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_TerminateOperation).

  ```
  DELETE /argoInstance/:argoInstanceName/applications/:argoAppName/operation
  ```

- **New query parameter!**: We introduced the ability to terminate your application's current operation prior to deleting the application and project. Argo applications will not delete if there is an operation in progress. We now allow the ability to terminate the current operation so that deleting can happened immediately.

  ```
  DELETE /argoInstance/:argoInstanceName/applications/:argoAppName?terminateOperation=true
  ```

- **Wait Interval configuration flag**: Often deleting the argo application takes time - it is not always immediate. An argo project cannot be deleted if the application still exists. To combat this, we chose to wait, by default, for 5 cycles for 5 seconds each, totaling for 25 seconds in waiting for the application to be deleted before deleting the project. We **do not** do this anymore. Our default is to not loop, and allow for the wait interval between loops to be configurable. You can now configure the wait interval time (in ms). You can still configure the amount of cycles. Please look at plugin's readme for more information and updates.

  ```yml
  argocd:
    waitInterval: 1000 # time in ms, optional number, default is 5000ms
    waitCycles: 2 # number of loops, optional number, default 1
  ```

#### BREAKING CHANGES 💥

- We are no longer waiting for an application to delete prior to attempting to delete a project due to the wait interval, wait cycle, and terminate operation changes. More details on these added features are in the above section. If you would like the same looping effect as before, you may adjust your `waitCycles` configuration value to be 5 (as this was the previous default loop count). This affects the `DELETE /argoInstance/:argoInstanceName/applications/:argoAppName` route.

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
