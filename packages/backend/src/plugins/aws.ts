import { createRouter } from '@roadiehq/backstage-plugin-aws-auth';
import type { PluginEnvironment } from '../types';

export default async function createPlugin({ logger }: PluginEnvironment) {
  return await createRouter(logger);
}