---
'@roadiehq/backstage-plugin-argo-cd-backend': minor
---

## 🚀 New Feature:

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
