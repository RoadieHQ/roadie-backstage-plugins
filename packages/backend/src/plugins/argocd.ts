/* eslint-disable notice/notice */
import { createRouter } from '@roadiehq/backstage-plugin-argo-cd-backend';
import { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  config,
}: PluginEnvironment) {
  return await createRouter({ logger, config });
}
