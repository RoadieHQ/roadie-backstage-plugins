// eslint-disable-next-line notice/notice
import {
  CatalogBuilder,
} from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  AWSEntityProvidersFactory,
  RunnableEntityProvider
} from '@roadiehq/catalog-backend-module-aws';
import { Duration } from 'luxon';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  const providers: RunnableEntityProvider[] = [];

  for (const config of env.config.getOptionalConfigArray(
    'integrations.aws',
  ) || []) {
    for (const provider of AWSEntityProvidersFactory.fromConfig(config, env)) {
      builder.addEntityProvider(provider);
      providers.push(provider);
    }
  }

  builder.addProcessor(new ScaffolderEntitiesProcessor());

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
