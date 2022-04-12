import {
  createServiceBuilder,
  loadBackendConfig,
} from '@backstage/backend-common';
import { Server } from 'http';
import { Logger } from 'winston';
import { createRouter } from './router';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({
    service: 'backstage-plugin-argo-cd-backend',
  });
  logger.debug('Starting application server...');

  const config = await loadBackendConfig({
    argv: process.argv,
    logger: logger,
  });

  const router = await createRouter({
    logger,
    config,
  });

  const service = createServiceBuilder(module)
    .enableCors({ origin: 'http://localhost:7007' })
    .addRouter('/backstage-plugin-argo-cd-backend', router);

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
