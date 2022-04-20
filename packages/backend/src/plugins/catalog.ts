// eslint-disable-next-line notice/notice
import {
  CatalogBuilder,
  EntityProvider,
} from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  AWSLambdaFunctionProvider,
  AWSS3BucketProvider,
} from '@roadiehq/catalog-backend-module-aws';
import { Duration } from 'luxon';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  type RunnableProvider = EntityProvider & {
    run: () => Promise<void>;
  };
  const builder = await CatalogBuilder.create(env);
  const providers: RunnableProvider[] = [];
  for (const config of env.config.getOptionalConfigArray(
    'catalog.providers.aws.accounts',
  ) || []) {
    const s3Provider = new AWSS3BucketProvider(
      config.getString('accountId'),
      config.getString('roleArn'),
    );
    const lambdaProvider = new AWSLambdaFunctionProvider(
      config.getString('accountId'),
      config.getString('roleArn'),
    );

    builder.addEntityProvider(s3Provider);
    builder.addEntityProvider(lambdaProvider);
    providers.push(s3Provider);
    providers.push(lambdaProvider);
  }

  builder.addProcessor(new ScaffolderEntitiesProcessor());

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  for (const [i, provider] of providers.entries()) {
    env.logger.info(`configuring ${provider.getProviderName()} schedule`);
    await env.scheduler.scheduleTask({
      id: `run_aws_update_${i}`,
      fn: async () => {
        await provider.run();
      },
      frequency: Duration.fromObject({ minutes: 1 }),
      timeout: Duration.fromObject({ minutes: 10 }),
    });
  }
  return router;
}
