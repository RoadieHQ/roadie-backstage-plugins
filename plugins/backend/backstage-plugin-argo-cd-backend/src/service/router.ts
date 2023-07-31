import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { ArgoService } from './argocd.service';
import { InstanceConfig } from './types';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}
export type Response = {
  status: string;
  message: string;
};
export function createRouter({
  logger,
  config,
}: RouterOptions): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  const argoUserName =
    config.getOptionalString('argocd.username') ?? 'argocdUsername';
  const argoPassword =
    config.getOptionalString('argocd.password') ?? 'argocdPassword';
  const argoSvc = new ArgoService(argoUserName, argoPassword, config, logger);

  const findArgoInstance = (argoInstanceName: string) => {
    const argoInstanceArray = argoSvc.getArgoInstanceArray();
    const foundArgoInstance = argoInstanceArray.find(
      argoInstance => argoInstance.name === argoInstanceName,
    );
    return foundArgoInstance;
  };

  async function findMatchedArgoInstanceToken(
    matchedArgoInstance: InstanceConfig,
  ) {
    let token: string;
    if (!matchedArgoInstance.token) {
      token = await argoSvc.getArgoToken(matchedArgoInstance);
    } else {
      token = matchedArgoInstance.token;
    }
    return token;
  }

  router.get('/allArgoApps/:argoInstanceName', async (request, response) => {
    const argoInstanceName = request.params.argoInstanceName;
    const matchedArgoInstance = findArgoInstance(argoInstanceName);
    if (matchedArgoInstance === undefined) {
      return response.status(500).send({
        status: 'failed',
        message: 'cannot find an argo instance to match this cluster',
      });
    }
    const token: string = await findMatchedArgoInstanceToken(
      matchedArgoInstance,
    );
    if (!token) {
      return response.status(500).send({
        status: 'failed',
        message: 'could not generate token',
      });
    }
    return response.send(
      await argoSvc.getArgoAppData(
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
      const matchedArgoInstance = findArgoInstance(argoInstanceName);
      if (matchedArgoInstance === undefined) {
        return response.status(500).send({
          status: 'failed',
          message: 'cannot find an argo instance to match this cluster',
        });
      }
      const token: string = await findMatchedArgoInstanceToken(
        matchedArgoInstance,
      );
      if (!token) {
        return response.status(500).send({
          status: 'failed',
          message: 'could not generate token',
        });
      }
      const argoData = await argoSvc.getArgoAppData(
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
    response.send(await argoSvc.findArgoApp({ name: argoAppName }));
  });

  router.get(
    '/argoInstance/:argoInstanceName/applications/name/:argoAppName/revisions/:revisionID/metadata',
    async (request, response) => {
      const revisionID: string = request.params.revisionID;
      const argoInstanceName: string = request.params.argoInstanceName;
      const argoAppName = request.params.argoAppName;
      logger.info(`Getting info on ${argoAppName}`);
      logger.info(`Getting app ${argoAppName} on ${argoInstanceName}`);
      const matchedArgoInstance = findArgoInstance(argoInstanceName);
      if (matchedArgoInstance === undefined) {
        return response.status(500).send({
          status: 'failed',
          message: 'cannot find an argo instance to match this cluster',
        });
      }
      const token: string = await findMatchedArgoInstanceToken(
        matchedArgoInstance,
      );
      const resp = await argoSvc.getRevisionData(
        matchedArgoInstance.url,
        { name: argoAppName },
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
      logger.info(`Getting info on ${argoAppName}`);
      logger.info(`Getting app ${argoAppName} on ${argoInstanceName}`);
      const matchedArgoInstance = findArgoInstance(argoInstanceName);
      if (matchedArgoInstance === undefined) {
        return response.status(500).send({
          status: 'failed',
          message: 'cannot find an argo instance to match this cluster',
        });
      }
      const token: string = await findMatchedArgoInstanceToken(
        matchedArgoInstance,
      );
      const resp = await argoSvc.getArgoAppData(
        matchedArgoInstance.url,
        matchedArgoInstance.name,
        token,
        { name: argoAppName },
      );
      return response.send(resp);
    },
  );
  router.get('/find/selector/:argoAppSelector', async (request, response) => {
    const argoAppSelector = request.params.argoAppSelector;
    response.send(await argoSvc.findArgoApp({ selector: argoAppSelector }));
  });
  router.get(
    '/argoInstance/:argoInstanceName/applications/selector/:argoAppSelector',
    async (request, response) => {
      const argoInstanceName = request.params.argoInstanceName;
      const argoAppSelector = request.params.argoAppSelector;
      logger.info(
        `Getting apps for selector ${argoAppSelector} on ${argoInstanceName}`,
      );
      const matchedArgoInstance = findArgoInstance(argoInstanceName);
      if (matchedArgoInstance === undefined) {
        return response.status(500).send({
          status: 'failed',
          message: 'cannot find an argo instance to match this cluster',
        });
      }
      const token: string = await findMatchedArgoInstanceToken(
        matchedArgoInstance,
      );
      const resp = await argoSvc.getArgoAppData(
        matchedArgoInstance.url,
        matchedArgoInstance.name,
        token,
        { selector: argoAppSelector },
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
    const matchedArgoInstance = findArgoInstance(argoInstanceName);
    if (matchedArgoInstance === undefined) {
      return response.status(500).send({
        status: 'failed',
        message: 'cannot find an argo instance to match this cluster',
      });
    }
    let token: string;
    if (!matchedArgoInstance.token) {
      try {
        token = await argoSvc.getArgoToken(matchedArgoInstance);
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
      await argoSvc.createArgoProject({
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
      await argoSvc.createArgoApplication({
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
    const matchedArgoInstance = findArgoInstance(argoInstanceName);

    if (matchedArgoInstance === undefined) {
      return response.status(500).send({
        status: 'failed',
        message: 'cannot find an argo instance to match this cluster',
      });
    }
    let token: string;
    if (!matchedArgoInstance.token) {
      try {
        token = await argoSvc.getArgoToken(matchedArgoInstance);
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
      await argoSvc.updateArgoProjectAndApp({
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
    try {
      const argoSyncResp = await argoSvc.resyncAppOnAllArgos({ appSelector });
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
      logger.info(`Getting info on ${argoInstanceName} and ${argoAppName}`);

      const argoDeleteAppandProjectResp = await argoSvc.deleteAppandProject({
        argoAppName,
        argoInstanceName,
      });
      return response.send(argoDeleteAppandProjectResp);
    },
  );

  router.use(errorHandler());
  return Promise.resolve(router);
}
