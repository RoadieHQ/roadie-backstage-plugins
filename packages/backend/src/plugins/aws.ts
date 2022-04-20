// eslint-disable-next-line notice/notice
import { createRouter } from '@roadiehq/backstage-plugin-aws-backend';
import type { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  config,
}: PluginEnvironment) {
  return await createRouter({ logger, config });
}
