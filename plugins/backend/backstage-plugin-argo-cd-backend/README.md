# Argo CD Plugin Backend for Backstage

## Support for multiple ArgoCD instances - Option 2 - Argo CD backend plugin

If you want to create multiple components that fetch data from different argoCD instances, you can dynamically set the ArgoCD instance url by adding the following to your app-config.yaml files.

The Argo plugin will fetch the Argo CD instances an app is deployed to and use the backstage-plugin-argo-cd-backend plugin to reach out to each Argo instance based on the mapping mentioned below.

```yml
argocd:
  username: ${ARGOCD_USERNAME}
  password: ${ARGOCD_PASSWORD}
  waitCycles: 25
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

### Wait Cycles

Between the Argo CD project delete and application delete there is a loop created to check for the deletion of the application before the deletion of a project can occur. Between each check there is a 3 second timer. The number of cycles to wait is an optional configuration value as shown above as `waitCycles`. If `waitCycles` is set to 25, the total time the loop can last before erroring out is 75 seconds.

### Permissions

Setting permissions for the Argo CD user account can reduce the scope, but also reduce the functionality of the backend. If you choose to scope the permissions for read-only get actions will work such as the catalog plugin but creating, deleting, and resyncing applications will not be available. The error handling has been designed to alert the users when the proper permissions are not in place.

### Self Signed Certificates

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
