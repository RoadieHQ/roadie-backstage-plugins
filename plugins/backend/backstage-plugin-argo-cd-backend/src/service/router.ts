import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { ArgoService } from './argocd.service';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

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
  const argoWaitCycles: number =
    config.getOptionalNumber('argocd.waitCycles') ?? 25;

  const argoSvc = new ArgoService(argoUserName, argoPassword, config);

  const argoApps = config
    .getConfigArray('argocd.appLocatorMethods')
    .filter(element => element.getString('type') === 'config');
  const appArray: Config[] = argoApps.reduce(
    (acc: Config[], argoApp: Config) =>
      acc.concat(argoApp.getConfigArray('instances')),
    [],
  );
  const argoInstanceArray = appArray.map(instance => ({
    name: instance.getString('name'),
    url: instance.getString('url'),
    token: instance.getOptionalString('token'),
  }));

  router.get('/find/name/:argoAppName', async (request, response) => {
    const argoAppName = request.params.argoAppName;
    response.send(await argoSvc.findArgoApp({ name: argoAppName }));
  });

  router.get(
    '/argoInstance/:argoInstanceName/applications/name/:argoAppName',
    async (request, response) => {
      const argoInstanceName = request.params.argoInstanceName;
      const argoAppName = request.params.argoAppName;
      logger.info(`Getting info on ${argoAppName}`);

      logger.info(`Getting app ${argoAppName} on ${argoInstanceName}`);
      const matchedArgoInstance = argoInstanceArray.find(
        argoInstance => argoInstance.name === argoInstanceName,
      );
      if (matchedArgoInstance === undefined) {
        return response.status(500).send({
          status: 'failed',
          message: 'cannot find an argo instance to match this cluster',
        });
      }

      let token: string;
      if (!matchedArgoInstance.token) {
        token = await argoSvc.getArgoToken(matchedArgoInstance.url);
      } else {
        token = matchedArgoInstance.token;
      }
      const resp = await argoSvc.getArgoAppData(
        matchedArgoInstance.url,
        matchedArgoInstance.name,
        { name: argoAppName },
        token,
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
      const matchedArgoInstance = argoInstanceArray.find(
        argoInstance => argoInstance.name === argoInstanceName,
      );
      if (matchedArgoInstance === undefined) {
        return response.status(500).send({
          status: 'failed',
          message: 'cannot find an argo instance to match this cluster',
        });
      }

      let token: string;
      if (!matchedArgoInstance.token) {
        token = await argoSvc.getArgoToken(matchedArgoInstance.url);
      } else {
        token = matchedArgoInstance.token;
      }
      const resp = await argoSvc.getArgoAppData(
        matchedArgoInstance.url,
        matchedArgoInstance.name,
        { selector: argoAppSelector },
        token,
      );
      return response.send(resp);
    },
  );

  router.post('/createArgo', async (request, response) => {
    const argoInstanceName = request.body.clusterName;
    const namespace = request.body.namespace;
    const projectName = request.body.projectName as string;
    const appName = request.body.appName as string;
    const labelValue = request.body.labelValue as string;
    const sourceRepo = request.body.sourceRepo;
    const sourcePath = request.body.sourcePath;

    const matchedArgoInstance = argoInstanceArray.find(
      argoInstance => argoInstance.name === argoInstanceName,
    );
    if (matchedArgoInstance === undefined) {
      return response.status(500).send({
        status: 'failed',
        message: 'cannot find an argo instance to match this cluster',
      });
    }

    let token: string;
    if (!matchedArgoInstance.token) {
      try {
        token = await argoSvc.getArgoToken(matchedArgoInstance.url);
      } catch (e: any) {
        return response.status(e.status || 500).send({
          status: e.status,
          message: e.message,
        });
      }
    } else {
      token = matchedArgoInstance.token;
    }

    let argoProjResp = {};
    try {
      argoProjResp = await argoSvc.createArgoProject({
        baseUrl: matchedArgoInstance.url,
        argoToken: token,
        projectName,
        namespace,
        sourceRepo,
      });
    } catch (e: any) {
      logger.error(argoProjResp);
      return response.status(e.status || 500).send({
        status: e.status,
        message: e.message || 'Failed to create argo project',
      });
    }

    let argoAppResp = {};
    try {
      argoAppResp = await argoSvc.createArgoApplication({
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
      logger.error(argoAppResp);
      return response.status(500).send({
        status: 500,
        message: e.message || 'Failed to create argo app',
      });
    }
  });

  router.post('/sync', async (request, response) => {
    const appSelector = request.body.appSelector;
    try {
      const argoSyncResp = await argoSvc.resyncAppOnAllArgos({appSelector});

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
      const argoInstanceName = request.params.argoInstanceName;
      const argoAppName = request.params.argoAppName;
      logger.info(`Getting info on ${argoInstanceName} and ${argoAppName}`);

      const matchedArgoInstance = argoInstanceArray.find(
        argoInstance => argoInstance.name === argoInstanceName,
      );
      if (matchedArgoInstance === undefined) {
        return response.status(500).send({
          status: 'failed',
          message: 'cannot find an argo instance to match this cluster',
        });
      }

      let token: string;
      if (!matchedArgoInstance.token) {
        token = await argoSvc.getArgoToken(matchedArgoInstance.url);
      } else {
        token = matchedArgoInstance.token;
      }

      let argoDeleteAppResp: boolean;
      try {
        argoDeleteAppResp = await argoSvc.deleteApp({
          baseUrl: matchedArgoInstance.url,
          argoApplicationName: argoAppName,
          argoToken: token,
        });
      } catch (e: any) {
        if (typeof e.message === 'string') {
          throw new Error(e.message);
        }
        return response
          .status(500)
          .send({ status: 'error with deleteing argo app' });
      }

      let argoDeleteProjectResp: boolean;
      try {
        let argoApp = await argoSvc.getArgoAppData(
          matchedArgoInstance.url,
          matchedArgoInstance.name,
          { name: argoAppName },
          token,
        );
        let isAppDeployed = 'metadata' in argoApp;
        for (
          let attempts = 0;
          attempts < argoWaitCycles && isAppDeployed;
          attempts++
        ) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          argoApp = await argoSvc.getArgoAppData(
            matchedArgoInstance.url,
            matchedArgoInstance.name,
            { name: argoAppName },
            token,
          );
          isAppDeployed = 'metadata' in argoApp;
        }
        argoDeleteProjectResp = await argoSvc.deleteProject({
          baseUrl: matchedArgoInstance.url,
          argoProjectName: argoAppName,
          argoToken: token,
        });
      } catch {
        return response
          .status(500)
          .send({ status: 'error with deleteing argo project' });
      }

      return response.send({
        argoDeleteAppResp: argoDeleteAppResp,
        argoDeleteProjectResp: argoDeleteProjectResp,
      });
    },
  );

  router.use(errorHandler());
  return Promise.resolve(router);
}
