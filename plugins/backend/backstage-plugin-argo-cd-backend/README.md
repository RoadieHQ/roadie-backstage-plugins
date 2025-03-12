# Argo CD Plugin Backend for Backstage

## New Backend System

```typescript
import { argocdServiceFactory } from '@roadiehq/backstage-plugin-argo-cd-backend';

backend.add(argocdServiceFactory); // Import Service Factory
backend.add(import('@roadiehq/backstage-plugin-argo-cd-backend/alpha')); // Import Plugin
```

If you have middleware you'd like to add, consider creating a module on top of this plugin.

## Support for multiple ArgoCD instances - Option 2 - Argo CD backend plugin

If you want to create multiple components that fetch data from different argoCD instances, you can dynamically set the ArgoCD instance url by adding the following to your app-config.yaml files.

The Argo plugin will fetch the Argo CD instances an app is deployed to and use the backstage-plugin-argo-cd-backend plugin to reach out to each Argo instance based on the mapping mentioned below.

```yml
argocd:
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: argoInstance1
          url: https://argoInstance1.com
          token: ${ARGOCD_AUTH_TOKEN} # optional
        - name: argoInstance2
          url: https://argoInstance2.com
          # dedicated username/password for this instance
          username: ${ARGOCD_USERNAME_INSTANCE_2} # optional
          password: ${ARGOCD_PASSWORD_INSTANCE_2} # optional
```

### Authentication

**Option 1**: Add the required auth tokens to environmental variables, `ARGOCD_USERNAME` and `ARGOCD_PASSWORD` inside the `argocd` object. It will be use as credentials for all instances by default.

_Example_

```yml
argocd:
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: argoInstance1
          url: https://argoInstance1.com
        - name: argoInstance2
          url: https://argoInstance2.com
```

**Option 2**: Define a `username` and a `password` for each instance. It has an higher priority than **Option 1**.

_Example_

```yml
argocd:
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: argoInstance1
          url: https://argoInstance1.com
        - name: argoInstance2
          url: https://argoInstance2.com
          # dedicated username/password for this instance
          username: ${ARGOCD_USERNAME_INSTANCE_2}
          password: ${ARGOCD_PASSWORD_INSTANCE_2}
```

**Option 3**: Define a `token` for each instance. It has an higher priority than **Option 1** and **Option 2**.

_Example_

```yml
argocd:
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  appLocatorMethods:
    - type: 'config'
      instances:
        - name: argoInstance1
          url: https://argoInstance1.com
          token: ${ARGOCD_AUTH_TOKEN} # Token to use to instance 1
```

**Option 4**: Define a `azure` service principal credentials. It has the lowest priority of all other options.

_Example_

```yml
azure:
  tenantId: ${AZURE_TENANT_ID}
  clientId: ${AZURE_CLIENT_ID}
  clientSecret: ${AZURE_CLIENT_SECRET}
  loginUrl: https://login.microsoftonline.com
```

#### Special Notes on Authenticating with Azure Active Directory (Microsoft Entra ID)

JAY, please document here.

## Project Resource Restrictions

In order to control what kind of resources are allowed or blocked by default on the created argo projects you can configure a black and/or white list at both the cluster and namespace levels.

_Example_

```yml
argocd:
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  projectSettings:
    # Sets the allowed resources at the cluster level
    clusterResourceWhitelist:
      - group: '*'
        kind: '*'
    # Sets the blocked resources at the cluster level
    clusterResourceBlacklist:
      - group: '*'
        kind: '*'
    # Sets the allowed resources at the namespace level
    namespaceResourceWhitelist:
      - group: '*'
        kind: '*'
    # Sets the blocked resources at the namespace level
    namespaceResourceBlacklist:
      - group: '*'
        kind: '*'
```

For example to block specific resources

```yml
argocd:
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  projectSettings:
    # block cluster roles and bindings
    clusterResourceBlacklist:
      - group: 'rbac.authorization.k8s.io'
        kind: 'ClusterRole'
      - group: 'rbac.authorization.k8s.io'
        kind: 'ClusterRoleBinding'
    # Blocks the creation of cron jobs
    namespaceResourceBlacklist:
      - group: 'batch'
        kind: 'CronJob'
```

Similarly you can instead allow only a certain set of resources

```yml
argocd:
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  projectSettings:
    clusterResourceBlacklist:
      - group: '*'
        kind: '*'
    # Only the listed resources will be allowed
    namespaceResourceWhitelist:
      - group: 'apps'
        kind: 'Deployment'
      - group: ''
        kind: 'Service'
      - group: 'networking.k8s.io'
        kind: 'Ingress'
```

## Deleting Argo Application and Project Configuration Options

### Wait Cycles and Wait Interval

Often deleting the argo application takes time - it is not always immediate. In fact, the request to delete an application is queued in argo. Consequently, an argo project cannot delete if the application is still pending deletion. This may result in abandoned projects because even when you delete an application with cascade set to true, the project does not eventually get deleted. You have an ability to combat this by waiting for the application to delete prior to attempting to delete the project. Currently, our default is to **NOT** check more than once with no wait time. You can configure the wait interval time (in ms) and the amount of checks separately. These are optional number fields. For example, if you set `waitCycles` to 5 (indicating the amount of times you would like to check the application's deletion status), and you choose NOT to customize the wait interval, then the total amount of time waiting for the application to be deleted would be 25 seconds (5 (number of checks) \* 5000ms (default wait time) = 25 seconds of waiting for application to delete before attempting to delete the project). The hopes is that doing this will allow for the project to be deleted successfully and not leave any project abandonded. However, there is another option to combat this - please look at the Terminate Operation Section below.

`waitCycles` \* `waitInterval` = total time in ms.

```yml
argocd:
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  .
  .
  .
  waitInterval: 1000 # time in ms, optional number, default is 5000ms
  waitCycles: 2 # number of checks, optional number, default is to check 1 time with no wait time
```

### Terminate Operation Query Parameter

The delete argo app and project endpoint has a feature to terminate the current operation on the application. There is a query parameter `terminateOperation` which when set to `true` will terminate the current application operation before proceeding to delete the application. This is helpful when the application is pending deletion due to a pending operation. Please see https://cd.apps.argoproj.io/swagger-ui#operation/ApplicationService_TerminateOperation for more information.

## Permissions

Setting permissions for the Argo CD user account can reduce the scope, but also reduce the functionality of the backend. If you choose to scope the permissions for read-only get actions will work such as the catalog plugin but creating, deleting, and re-syncing applications will not be available. The error handling has been designed to alert the users when the proper permissions are not in place.

## Self Signed Certificates

By default the Argo CD Server will generate a self signed certificate. For testing purposes you can use the below to allow `http` traffic. **This should not be used for production.** The backend will validate certificates and a self signed certificate will not work properly, which is why for testing enabling `http` might be preferred.

Once you have installed Argo CD, the deployment of `argocd-server` can be patched to be insecure using the below command,

```bash
kubectl patch deployment argocd-server --type "json" -p '[{"op":"add","path":"/spec/template/spec/containers/0/command/-","value":"--insecure"}]'
```

Or using Helm you can install Argo CD and be insecure by default.

```bash
helm upgrade --install argocd argo/argo-cd \
  --version 3.33.5 \
  --set 'server.extraArgs={--insecure}'
```

## Contributed By American Airlines

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).
