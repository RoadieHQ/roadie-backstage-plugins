# aws-backend

Backend plugin that generates temporary credentials in order to perform requests to aws services from backstage's frontend

## Example usage

This is an example how you set api keys in your frontend application when using aws sdk:

```js
async function generateCredentials(backendUrl: string) {
  const resp = await (await fetch(`${backendUrl}/aws/credentials`)).json();
  return new AWS.Credentials({
    accessKeyId: resp.AccessKeyId,
    secretAccessKey: resp.SecretAccessKey,
    sessionToken: resp.SessionToken,
  });
}
AWS.config.credentials = await generateCredentials(backendUrl);
```

### Using an IAM Role for Cross-account

You can specify an AWS IAM Role Arn in the body of the request to facilitate cross-account lookups via the Assume Role methodology. You will need to ensure the IAM credentials made available to Backstage have the `sts:AssumeRole` in its attached IAM policy.

```js
async function generateCredentials(backendUrl: string) {
  const reqBody = JSON.stringify({ RoleArn: 'arn:aws:iam::0123456789012:role/Example' });
  const resp = await (await fetch(`${backendUrl}/aws/credentials`, { body: reqBody })).json();
  return new AWS.Credentials({
    accessKeyId: resp.AccessKeyId,
    secretAccessKey: resp.SecretAccessKey,
    sessionToken: resp.SessionToken,
  });
}
AWS.config.credentials = await generateCredentials(backendUrl);
```

## Starting the Auth Backend

Please create an IAM user (with api keys capabilities) with permissions as little as possible to perform actions from backstage (e.g. only operation lambda:GetFunction with specified resource list)

then, please set environment variables with api keys from previously create IAM user. The plugin will use default AWS credential provider chain if environment variables are not set. You can find more information about credential provider chain from [AWS docs](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html). 

You can run plugin locally as standalone by:

```bash
export AWS_ACCESS_KEY_ID=x
export AWS_ACCESS_KEY_SECRET=x
yarn start
```

To add plugin to the backstage app, you have to install it in the `packages/backend` directory:

```bash
yarn add @roadiehq/backstage-plugin-aws-auth
```

And paste following code snippets:

```js
// packages/backend/src/plugins/aws.ts

import { createRouter } from '@roadiehq/backstage-plugin-aws-auth';
import type { PluginEnvironment } from '../types';

export default async function createPlugin({ logger }: PluginEnvironment) {
  return await createRouter(logger);
}
```

```js
// packages/backend/src/index.ts

import aws from './plugins/aws';
...
const awsEnv = useHotMemoize(module, () => createEnv('aws'));
...
const apiRouter = Router();
...
apiRouter.use('/aws', await aws(awsEnv));
```
