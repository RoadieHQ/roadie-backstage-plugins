---
'@roadiehq/backstage-plugin-argo-cd-backend': major
---

#### New Feature ✨

- New Endpoint! : Terminate Application Operation endpoint is a proxy to the [argocd terminate application operation functionality](https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_TerminateOperation).

      `DELETE /argoInstance/:argoInstanceName/applications/:argoAppName/operation`

- New query parameter! : We introduced the ability to terminate your application's current operation prior to deleting the application and project. Argo applications will not delete if there is an operation in progress. We now allow the ability to terminate the current operation so that deleting can happened immediately.

  `?terminateOperation=true` is the query parameter you can use on the delete argo application and project endpoint.

- Wait Interval configuration flag: Often deleting the argo application takes time - it is not always immediate. An argo project cannot be deleted if the application still exists. To combat this, we chose to wait, by default, for 5 cycles for 5 seconds each, totaling for 25 seconds in waiting for the application to be deleted before deleting the project. We **do not** do this anymore. Our default is to not loop, and allow for the wait interval between loops to be configurable. You can now configure the wait interval time (in ms). You can still configure the amount of cycles. Please look at plugin's readme for more information and updates.

  ```yml
  argocd:
    waitInterval: 1000 # time in ms, optional number, default is 5000ms
    waitCycles: 2 # number of loops, optional number, default 1
  ```

#### BREAKING CHANGES 💥

- Response Change: Route for deleting argocd application and project response changed.

  `DELETE /argoInstance/:argoInstanceName/applications/:argoAppName`

  We introduced a new key (terminateOperationDetails) to the object that normally returns from the endpoint above, and changes to the original response names.

  Below is the type for reference. Please look at the commit to determine what we the previous response was.

  ```typescript
  type ArgoErrorResponse = {
    message: string;
    error: string;
    code: number;
  };

  type DeleteResponse =
    | (ArgoErrorResponse & { statusCode: Exclude<HttpStatusCodes, 200> })
    | { statusCode: 200 };

  type status = 'pending' | 'success' | 'failed' | 'unknown';

  type ResponseSchema<T> = {
    status: Exclude<status, 'unknown'>;
    message: string;
    argoResponse: T;
  };

  type ResponseSchemaUnknown = {
    status: Extract<status, 'unknown' | 'failed'>;
    message: string;
    argoResponse: Record<string, never>;
  };

  type DeleteApplicationAndProjectResponse = {
    terminateOperationDetails?:
      | ResponseSchema<DeleteResponse>
      | ResponseSchemaUnknown;
    deleteAppDetails:
      | ResponseSchema<DeleteResponse | ArgoApplication>
      | ResponseSchemaUnknown;
    deleteProjectDetails:
      | ResponseSchema<DeleteResponse>
      | ResponseSchemaUnknown;
  };
  ```

Please look at plugin's readme for more information and commit for more information on response type changes.
