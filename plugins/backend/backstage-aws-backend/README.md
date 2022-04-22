# AWS Plugin Backend for Backstage

To use the backend, you will need to configure the following in the app-config.yaml file:

Region and External ID are optional.

```yaml
integrations:
  aws:
    - accountId: '9999999999'
      roleArn: arn:aws:iam::9999999999:role/ops
      region: eu-west-1
      externalId: 'blah'
```

Create a file in `packages/backend/src/plugins/aws.ts`

```typescript
import { createRouter } from '@roadiehq/backstage-plugin-aws-backend';
import type { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  config,
}: PluginEnvironment) {
  return await createRouter({ logger, config });
}
```

In `packages/backend/src/index.ts` add the following:

```typescript
import aws from './plugins/aws';
// ...
async function main() {
    // ...
    const awsEnv = useHotMemoize(module, () => createEnv('aws'));
    const apiRouter = Router();
    apiRouter.use('/aws', await aws(awsEnv));
    // ...
}
```

At this point you can retrieve details of an aws resource as follows:

You can optionally pass a parameter `region`.

```bash
$ curl http://localhost:7007/api/aws/9999999999/AWS::S3::Bucket/bucket1
{ "Arn":"arn:aws:s3:::bucket1", "BucketName":"bucket1", ... }
```