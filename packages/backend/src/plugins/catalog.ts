// eslint-disable-next-line notice/notice
import {
  CatalogBuilder,
  createRouter,
} from '@backstage/plugin-catalog-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addProcessor(new ScaffolderEntitiesProcessor())
  const {
    entitiesCatalog,
    locationService,
    processingEngine,
    locationAnalyzer,
  } = await builder.build();

  await processingEngine.start();

  return await createRouter({
    entitiesCatalog,
    locationService,
    locationAnalyzer,
    logger: env.logger,
    config: env.config,
  });
}
