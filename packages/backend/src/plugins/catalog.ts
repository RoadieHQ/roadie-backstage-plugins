// eslint-disable-next-line notice/notice
import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  AwsLambdaFunctionDiscoveryProcessor,
  AwsS3BucketDiscoveryProcessor
} from "@roadiehq/plugin-catalog-processors-aws";

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.addProcessor(new AwsS3BucketDiscoveryProcessor());
  builder.addProcessor(new AwsLambdaFunctionDiscoveryProcessor());

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
