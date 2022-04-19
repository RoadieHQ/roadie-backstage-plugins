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
          token: ${ARGOCD_AUTH_TOKEN}
        - name: argoInstance2
          url: https://argoInstance2.com
```

Add the required auth tokens to environmental variables, `ARGOCD_USERNAME` and `ARGOCD_PASSWORD`.

Between the Argo CD project delete and application delete there is a loop created to check for the deletion of the application before the deletion of a project can occur. Between each check there is a 3 second timer. The number of cycles to wait is an optional configuration value as shown above as `waitCycles`. If `waitCycles` is set to 25, the total time the loop can last before erroring out is 75 seconds.

You can also use an argo session token as mentioned above in the `argocd` object as shown above. If omitted, we will use the argo username and password from the code block above.

Setting permissions for the Argo CD user account can reduce the scope, but also reduce the functionality of the backend. If you choose to scope the permissions for read-only get actions will work such as the catalog plugin but creating, deleting, and resyncing applications will not be available. The error handling has been designed to alert the users when the proper permissions are not in place.

## Contributed By American Airlines