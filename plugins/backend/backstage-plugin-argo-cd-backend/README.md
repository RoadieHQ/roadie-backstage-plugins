# Argo CD Plugin Backend for Backstage

[https://roadie.io/backstage/plugins/argo-cd](https://roadie.io/backstage/plugins/argo-cd)


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
          token: ${ARGOCD_AUTH_TOKEN}
        - name: argoInstance2
          url: https://argoInstance2.com
          # dedicated username/password for this instance
          username: ${ARGOCD_USERNAME_INSTANCE_2}
          password: ${ARGOCD_PASSWORD_INSTANCE_2}
```

Add the required auth tokens to environmental variables, `ARGOCD_USERNAME` and `ARGOCD_PASSWORD`.
Define a `username` and a `password` for each instance if needed.

You can also use an argo session token as mentioned above in the `argocd` object as shown above. If omitted, we will use the argo username and password from the code block above.

## Contributed By American Airlines