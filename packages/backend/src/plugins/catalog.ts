// eslint-disable-next-line notice/notice
import {
  CatalogBuilder,
  EntityProvider,
} from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { BambooHrUserProvider, BambooHROrgProcessor } from "@roadiehq/catalog-backend-module-bamboohr"
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  AWSLambdaFunctionProvider,
  AWSS3BucketProvider,
  AWSIAMUserProvider
} from '@roadiehq/catalog-backend-module-aws';
import { Duration } from 'luxon';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {

  type RunnableProvider = EntityProvider & {
    run: () => Promise<void>;
  };
  const { config } = env
  const builder = await CatalogBuilder.create(env);
  const providers: RunnableProvider[] = [];
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.addProcessor(BambooHROrgProcessor.fromConfig(config, env));

  for (const config of env.config.getOptionalConfigArray(
    'integrations.aws',
  ) || []) {
    const s3Provider = AWSS3BucketProvider.fromConfig(config, env);
    const lambdaProvider = AWSLambdaFunctionProvider.fromConfig(config, env);
    const iamUserProvider = AWSIAMUserProvider.fromConfig(config, env);

    builder.addEntityProvider(s3Provider);
    builder.addEntityProvider(lambdaProvider);
    builder.addEntityProvider(iamUserProvider);
    providers.push(s3Provider);
    providers.push(lambdaProvider);
    providers.push(iamUserProvider);
  }
  const bamboohrUserProvider = BambooHrUserProvider.fromConfig(
    config, env
  );
  builder.addEntityProvider(bamboohrUserProvider);
  providers.push(bamboohrUserProvider);

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  for (const [i, provider] of providers.entries()) {
    env.logger.info(`configuring ${provider.getProviderName()} schedule`);
    await env.scheduler.scheduleTask({
      id: `run_${provider.getProviderName()}_${i}`,
      fn: async () => {
        await provider.run();
      },
      frequency: Duration.fromObject({ minutes: 1 }),
      timeout: Duration.fromObject({ minutes: 10 }),
    });
  }
  return router;
}
