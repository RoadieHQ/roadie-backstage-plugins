import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { getArgoConfigByInstanceName } from '../utils/getArgoConfig';
import { ArgoServiceApi } from './types';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  argocdService: ArgoServiceApi;
}
export type Response = {
  status: string;
  message: string;
};
export function createRouter({
  logger,
  argocdService,
}: RouterOptions): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/allArgoApps/:argoInstanceName', async (request, response) => {
    const argoInstanceName = request.params.argoInstanceName;
    const matchedArgoInstance = getArgoConfigByInstanceName({
      argoInstanceName,
      argoConfigs: argocdService.getArgoInstanceArray(),
    });

    if (matchedArgoInstance === undefined) {
      return response.status(500).send({
        status: 'failed',
        message: 'cannot find an argo instance to match this cluster',
      });
    }
    const token: string =
      matchedArgoInstance.token ??
      (await argocdService.getArgoToken(matchedArgoInstance));

    if (!token) {
      return response.status(500).send({
        status: 'failed',
        message: 'could not generate token',
      });
    }
    return response.send(
      await argocdService.getArgoAppData(
        matchedArgoInstance.url,
        matchedArgoInstance.name,
        token,
      ),
    );
  });

  router.get(
    '/argoInstance/:argoInstance/repo/:repo/source/:source',
    async (request, response) => {
      const argoInstanceName = request.params.argoInstance;
      const matchedArgoInstance = getArgoConfigByInstanceName({
        argoInstanceName,
        argoConfigs: argocdService.getArgoInstanceArray(),
      });
      if (matchedArgoInstance === undefined) {
        return response.status(500).send({
          status: 'failed',
          message: 'cannot find an argo instance to match this cluster',
        });
      }
      const token: string =
        matchedArgoInstance.token ??
        (await argocdService.getArgoToken(matchedArgoInstance));

      if (!token) {
        return response.status(500).send({
          status: 'failed',
          message: 'could not generate token',
        });
      }
      const argoData = await argocdService.getArgoAppData(
        matchedArgoInstance.url,
        matchedArgoInstance.name,
        token,
      );
      const repoAndSource = argoData.items.map(
        (argoApp: any) =>
          `${argoApp?.spec?.source?.repoURL}/${argoApp?.spec?.source?.path}`,
      );
      return response.send(
        repoAndSource.includes(
          `${request.params.repo}/${decodeURIComponent(request.params.source)}`,
        ),
      );
    },
  );

  router.get('/find/name/:argoAppName', async (request, response) => {
    const argoAppName = request.params.argoAppName;
    const argoAppNamespace = request.query?.appNamespace;
    response.send(
      await argocdService.findArgoApp({
        name: argoAppName as string,
        namespace: argoAppNamespace as string,
      }),
    );
  });

  router.get(
    '/argoInstance/:argoInstanceName/applications/name/:argoAppName/revisions/:revisionID/metadata',
    async (request, response) => {
      const revisionID: string = request.params.revisionID;
      const argoInstanceName: string = request.params.argoInstanceName;
      const argoAppName = request.params.argoAppName;
      const argoAppNamespace = request.query?.appNamespace;
      logger.info(`Getting info on ${argoAppName}`);
      logger.info(`Getting app ${argoAppName} on ${argoInstanceName}`);
      const matchedArgoInstance = getArgoConfigByInstanceName({
        argoInstanceName,
        argoConfigs: argocdService.getArgoInstanceArray(),
      });
      if (matchedArgoInstance === undefined) {
        return response.status(500).send({
          status: 'failed',
          message: 'cannot find an argo instance to match this cluster',
        });
      }
      const token: string =
        matchedArgoInstance.token ??
        (await argocdService.getArgoToken(matchedArgoInstance));

      const resp = await argocdService.getRevisionData(
        matchedArgoInstance.url,
        {
          name: argoAppName,
          namespace: argoAppNamespace as string,
        },
        token,
        revisionID,
      );
      return response.send(resp);
    },
  );

  router.get(
    '/argoInstance/:argoInstanceName/applications/name/:argoAppName',
    async (request, response) => {
      const argoInstanceName: string = request.params.argoInstanceName;
      const argoAppName = request.params.argoAppName;
      const argoAppNamespace = request.query?.appNamespace;
      logger.info(`Getting info on ${argoAppName}`);
      logger.info(`Getting app ${argoAppName} on ${argoInstanceName}`);
      const matchedArgoInstance = getArgoConfigByInstanceName({
        argoInstanceName,
        argoConfigs: argocdService.getArgoInstanceArray(),
      });
      if (matchedArgoInstance === undefined) {
        return response.status(500).send({
          status: 'failed',
          message: 'cannot find an argo instance to match this cluster',
        });
      }
      const token: string =
        matchedArgoInstance.token ??
        (await argocdService.getArgoToken(matchedArgoInstance));

      const resp = await argocdService.getArgoAppData(
        matchedArgoInstance.url,
        matchedArgoInstance.name,
        token,
        { name: argoAppName, namespace: argoAppNamespace as string },
      );
      return response.send(resp);
    },
  );
  router.get('/find/selector/:argoAppSelector', async (request, response) => {
    const argoAppSelector = request.params.argoAppSelector;
    const argoAppNamespace = request.query?.appNamespace;
    logger.info(`Getting apps for selector ${argoAppSelector}`);
    response.send(
      await argocdService.findArgoApp({
        selector: argoAppSelector,
        namespace: argoAppNamespace as string,
      }),
    );
  });
  router.get(
    '/argoInstance/:argoInstanceName/applications/selector/:argoAppSelector',
    async (request, response) => {
      const argoInstanceName = request.params.argoInstanceName;
      const argoAppSelector = request.params.argoAppSelector;
      const argoAppNamespace = request.query?.appNamespace;
      logger.info(
        `Getting apps for selector ${argoAppSelector} on ${argoInstanceName}`,
      );
      const matchedArgoInstance = getArgoConfigByInstanceName({
        argoInstanceName,
        argoConfigs: argocdService.getArgoInstanceArray(),
      });
      if (matchedArgoInstance === undefined) {
        return response.status(500).send({
          status: 'failed',
          message: 'cannot find an argo instance to match this cluster',
        });
      }
      const token: string =
        matchedArgoInstance.token ??
        (await argocdService.getArgoToken(matchedArgoInstance));

      const resp = await argocdService.getArgoAppData(
        matchedArgoInstance.url,
        matchedArgoInstance.name,
        token,
        {
          selector: argoAppSelector,
          namespace: argoAppNamespace as string,
        },
      );
      return response.send(resp);
    },
  );
  router.post('/createArgo', async (request, response) => {
    const argoInstanceName: string = request.body.clusterName;
    const namespace = request.body.namespace;
    const projectName = request.body.projectName as string;
    const appName = request.body.appName as string;
    const labelValue = request.body.labelValue as string;
    const sourceRepo = request.body.sourceRepo;
    const sourcePath = request.body.sourcePath;
    const matchedArgoInstance = getArgoConfigByInstanceName({
      argoInstanceName,
      argoConfigs: argocdService.getArgoInstanceArray(),
    });
    if (matchedArgoInstance === undefined) {
      return response.status(500).send({
        status: 'failed',
        message: 'cannot find an argo instance to match this cluster',
      });
    }
    let token: string;
    if (!matchedArgoInstance.token) {
      try {
        token = await argocdService.getArgoToken(matchedArgoInstance);
      } catch (e: any) {
        return response.status(e.status || 500).send({
          status: e.status,
          message: e.message,
        });
      }
    } else {
      token = matchedArgoInstance.token;
    }
    try {
      await argocdService.createArgoProject({
        baseUrl: matchedArgoInstance.url,
        argoToken: token,
        projectName,
        namespace,
        sourceRepo,
      });
    } catch (e: any) {
      logger.error(e);
      return response.status(e.status || 500).send({
        status: e.status,
        message: e.message || 'Failed to create argo project',
      });
    }

    try {
      await argocdService.createArgoApplication({
        baseUrl: matchedArgoInstance.url,
        argoToken: token,
        projectName,
        appName,
        namespace,
        sourceRepo,
        sourcePath,
        labelValue,
      });
      return response.send({
        argoProjectName: projectName,
        argoAppName: appName,
        kubernetesNamespace: namespace,
      });
    } catch (e: any) {
      return response.status(500).send({
        status: 500,
        message: e.message || 'Failed to create argo app',
      });
    }
  });
  router.put('/updateArgo/:argoAppName', async (request, response) => {
    const argoInstanceName: string = request.body.clusterName;
    const namespace = request.body.namespace;
    const projectName = request.body.projectName as string;
    const appName = request.body.appName as string;
    const labelValue = request.body.labelValue as string;
    const sourceRepo = request.body.sourceRepo;
    const sourcePath = request.body.sourcePath;
    const matchedArgoInstance = getArgoConfigByInstanceName({
      argoInstanceName,
      argoConfigs: argocdService.getArgoInstanceArray(),
    });

    if (matchedArgoInstance === undefined) {
      return response.status(500).send({
        status: 'failed',
        message: 'cannot find an argo instance to match this cluster',
      });
    }
    let token: string;
    if (!matchedArgoInstance.token) {
      try {
        token = await argocdService.getArgoToken(matchedArgoInstance);
      } catch (e: any) {
        return response.status(e.status || 500).send({
          status: e.status,
          message: e.message,
        });
      }
    } else {
      token = matchedArgoInstance.token;
    }

    try {
      await argocdService.updateArgoProjectAndApp({
        instanceConfig: matchedArgoInstance,
        argoToken: token,
        projectName,
        appName,
        namespace,
        sourceRepo,
        sourcePath,
        labelValue,
      });
      return response.send({
        argoProjectName: projectName,
        argoAppName: appName,
        kubernetesNamespace: namespace,
      });
    } catch (e: any) {
      logger.error(e);
      return response.status(e.status || 500).send({
        status: e.status,
        message: e.message || 'Failed to create argo project',
      });
    }
  });
  router.post('/sync', async (request, response) => {
    const appSelector = request.body.appSelector;
    const terminateOperation: boolean =
      Boolean(request.body.terminateOperation) ?? false;
    try {
      const argoSyncResp = await argocdService.resyncAppOnAllArgos({
        appSelector,
        terminateOperation,
      });
      return response.send(argoSyncResp);
    } catch (e: any) {
      return response.status(e.status || 500).send({
        status: e.status || 500,
        message: e.message || `Failed to sync your app, ${appSelector}.`,
      });
    }
  });
  router.delete(
    '/argoInstance/:argoInstanceName/applications/:argoAppName',
    async (request, response) => {
      const argoInstanceName: string = request.params.argoInstanceName;
      const argoAppName: string = request.params.argoAppName;
      const terminateOperation: boolean =
        Boolean(request.query.terminateOperation) ?? false;
      logger.info(`Getting info on ${argoInstanceName} and ${argoAppName}`);

      const argoDeleteAppandProjectResp =
        await argocdService.deleteAppandProject({
          argoAppName,
          argoInstanceName,
          terminateOperation,
        });
      return response.send(argoDeleteAppandProjectResp);
    },
  );

  router.get(
    '/argoInstance/:argoInstanceName/applications/:argoAppName',
    async (request, response) => {
      const argoInstanceName: string = request.params.argoInstanceName;
      const argoApplicationName: string = request.params.argoAppName;

      const applicationInformation = await argocdService.getArgoApplicationInfo(
        {
          argoApplicationName,
          argoInstanceName,
        },
      );

      return response
        .status(applicationInformation.statusCode)
        .send(applicationInformation);
    },
  );

  router.delete(
    '/argoInstance/:argoInstanceName/applications/:argoAppName/operation',
    async (request, response) => {
      const argoInstanceName: string = request.params.argoInstanceName;
      const argoAppName: string = request.params.argoAppName;

      const terminateArgoAppOperationResp =
        await argocdService.terminateArgoAppOperation({
          argoAppName,
          argoInstanceName,
        });
      return response
        .status(terminateArgoAppOperationResp.statusCode)
        .send(terminateArgoAppOperationResp);
    },
  );

  router.use(errorHandler());
  return Promise.resolve(router);
}
