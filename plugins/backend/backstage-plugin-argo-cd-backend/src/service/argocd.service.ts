import { Config } from '@backstage/config';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from 'winston';

export type findArgoAppResp = {
  name: string;
  url: string;
  appName: Array<string>;
};

export type SyncResponse = {
  status: 'Success' | 'Failure';
  message: string;
};

export interface ArgoServiceApi {
  getArgoToken: (token: string) => Promise<string>;
  getArgoAppData: (
    baseUrl: string,
    argoInstanceName: string,
    options: {
      name: string;
      selector: string;
    },
    argoToken: string,
  ) => Promise<object>;
  createArgoProject: (
    baseUrl: string,
    argoToken: string,
    projectName: string,
    namespace: string,
    sourceRepos: string,
  ) => Promise<object>;
  createArgoApplication: (
    baseUrl: string,
    argoToken: string,
    appName: string,
    projectName: string,
    namespace: string,
    sourceRepo: string,
    sourcePath: string,
    labelValue: string,
  ) => Promise<object>;
  createArgoResources: (
    argoInstance: string,
    appName: string,
    projectName: string,
    namespace: string,
    sourceRepo: string,
    sourcePath: string,
    labelValue: string,
    logger: Logger,
  ) => Promise<boolean>;
  deleteProject: (
    baseUrl: string,
    argoAppName: string,
    argoToken: string,
  ) => Promise<boolean>;
  deleteApp: (
    baseUrl: string,
    argoAppName: string,
    argoToken: string,
  ) => Promise<boolean>;
  syncArgoApp: (
    argoInstance: findArgoAppResp,
    argoToken: string,
    appName: string,
  ) => Promise<SyncResponse>;
  resyncAppOnAllArgos: (appSelector: string) => Promise<SyncResponse[][]>;
  findArgoApp: (options: {
    name?: string;
    selector?: string;
  }) => Promise<findArgoAppResp[]>;
}

export class ArgoService implements ArgoServiceApi {
  constructor(
    private username: string,
    private password: string,
    private config: Config,
  ) {}

  async findArgoApp(options: {
    name?: string;
    selector?: string;
  }): Promise<findArgoAppResp[]> {
    if (!options.name && !options.selector) {
      throw new Error('Neither name nor selector provided');
    }
    const argoApps = this.config
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
    const resp = await Promise.all(
      argoInstanceArray.map(async (argoInstance: any) => {
        let token: string;
        if (!argoInstance.token) {
          token = await this.getArgoToken(argoInstance.url);
        } else {
          token = argoInstance.token;
        }
        let getArgoAppDataResp: any;
        try {
          getArgoAppDataResp = await this.getArgoAppData(
            argoInstance.url,
            argoInstance.name,
            options,
            token,
          );
        } catch (error: any) {
          getArgoAppDataResp = { error: true };
        }
        if (!getArgoAppDataResp.error) {
          const output: findArgoAppResp = {
            name: argoInstance.name as string,
            url: argoInstance.url as string,
            appName: [],
          };
          if (options.selector) {
            const appNames: Array<string> = getArgoAppDataResp.items.map(
              (appInstance: any) => appInstance.metadata.name,
            );
            output.appName = appNames;
          } else if (options.name) {
            output.appName.push(options.name);
          }
          return output;
        }
        return null;
      }),
    ).catch();
    return resp.flatMap(f => (f ? [f] : []));
  }

  async getArgoToken(baseUrl: string): Promise<string> {
    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${baseUrl}/api/v1/session`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        username: `${this.username}`,
        password: `${this.password}`,
      },
    };

    try {
      const resp = await axios.request(options);
      return resp.data.token;
    } catch {
      throw new Error(
        `Could not retrieve ArgoCD token for instance. ${baseUrl}`,
      );
    }
  }

  async getArgoAppData(
    baseUrl: string,
    argoInstanceName: string,
    options: {
      name?: string;
      selector?: string;
    },
    argoToken: string,
  ): Promise<any> {
    const urlSuffix = options.name
      ? `/${options.name}`
      : `?selector=${options.selector}`;
    const requestOptions: AxiosRequestConfig = {
      method: 'GET',
      url: `${baseUrl}/api/v1/applications${urlSuffix}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${argoToken}`,
      },
    };
    try {
      const resp = await axios.request(requestOptions);
      if (resp.data.items) {
        (resp.data.items as any[]).forEach(item => {
          item.metadata.instance = { name: argoInstanceName };
        });
      } else if (resp.data && options.name) {
        resp.data.instance = argoInstanceName;
      } else {
        throw new Error('Not found');
      }
      return resp.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return error.response?.data;
      }
      throw new Error('Could not retrieve ArgoCD app data.');
    }
  }

  async createArgoProject(
    baseUrl: string,
    argoToken: string,
    projectName: string,
    namespace: string,
    sourceRepo: string,
  ): Promise<object> {
    const data = {
      project: {
        metadata: {
          name: projectName,
        },
        spec: {
          destinations: [
            {
              name: 'local',
              namespace: namespace,
              server: 'https://kubernetes.default.svc',
            },
          ],
          sourceRepos: [sourceRepo],
        },
      },
    };

    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${baseUrl}/api/v1/projects`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${argoToken}`,
      },
      data: data,
    };
    try {
      const resp = await axios.request(options);
      return resp.data;
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 404) {
        return error.response?.data;
      }
      if (
        error.response?.data.message.includes(
          'existing project spec is different',
        )
      ) {
        throw new Error(
          'Duplicate project detected. Cannot overwrite existing.',
        );
      } else {
        throw new Error('Could not create ArgoCD project.');
      }
    }
  }

  async createArgoApplication(
    baseUrl: string,
    argoToken: string,
    appName: string,
    projectName: string,
    namespace: string,
    sourceRepo: string,
    sourcePath: string,
    labelValue: string,
  ): Promise<object> {
    const data = {
      metadata: {
        name: appName,
        labels: { 'backstage-name': labelValue },
        finalizers: ['resources-finalizer.argocd.argoproj.io'],
      },
      spec: {
        destination: {
          namespace: namespace,
          server: 'https://kubernetes.default.svc',
        },
        project: projectName,
        revisionHistoryLimit: 10,
        source: {
          path: sourcePath,
          repoURL: sourceRepo,
        },
        syncPolicy: {
          automated: {
            allowEmpty: true,
            prune: true,
            selfHeal: true,
          },
          retry: {
            backoff: {
              duration: '5s',
              factor: 2,
              maxDuration: '5m',
            },
            limit: 10,
          },
          syncOptions: ['CreateNamespace=false'],
        },
      },
    };

    let header = {};
    header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${argoToken}`,
    };

    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `${baseUrl}/api/v1/applications`,
      headers: header,
      data: data,
    };

    try {
      const resp = await axios.request(options);
      return resp.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          `${error.response.status} ${error.response?.data.error}`,
        );
      }
      throw new Error('Could not create ArgoCD application.');
    }
  }

  async resyncAppOnAllArgos(appSelector: string): Promise<SyncResponse[][]> {
    const findArgoAppResp: findArgoAppResp[] = await this.findArgoApp({
      selector: appSelector,
    });

    const parallelSyncCalls = findArgoAppResp.map(
      async (argoInstance: any): Promise<SyncResponse[]> => {
        try {
          const token = await this.getArgoToken(argoInstance.url);
          try {
            const resp = argoInstance.appName.map(
              (argoApp: any): Promise<SyncResponse> => {
                return this.syncArgoApp(argoInstance, token, argoApp);
              },
            );
            return await Promise.all(resp);
          } catch (e: any) {
            return [{ status: 'Failure', message: e.message }];
          }
        } catch (e: any) {
          return [{ status: 'Failure', message: e.message }];
        }
      },
    );

    return await Promise.all(parallelSyncCalls);
  }

  async syncArgoApp(
    argoInstance: findArgoAppResp,
    argoToken: string,
    appName: string,
  ): Promise<SyncResponse> {
    const data = {
      prune: false,
      dryRun: false,
      strategy: {
        hook: {
          force: true,
        },
      },
      resources: null,
    };

    try {
      const resp = await axios.post(
        `${argoInstance.url}/api/v1/applications/${appName}/sync`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${argoToken}`,
          },
        },
      );
      if (resp.status === 200) {
        return {
          status: 'Success',
          message: `Re-synced ${appName} on ${argoInstance.name}`,
        };
      }
      throw new Error(`Failed to resync ${appName} on ${argoInstance.name}`);
    } catch (e: any) {
      if (axios.isAxiosError(e) && e.response) {
        const axiosError = `error: ${e.response.data.error}, message: ${e.response.data.message}`;
        return { status: 'Failure', message: axiosError };
      }

      return { status: 'Failure', message: e.message };
    }
  }

  async deleteApp(
    baseUrl: string,
    argoAppName: string,
    argoToken: string,
  ): Promise<boolean> {
    const options: AxiosRequestConfig = {
      method: 'DELETE',
      url: `${baseUrl}/api/v1/applications/${argoAppName}`,
      params: { cascade: 'true' },
      headers: {
        Authorization: `Bearer ${argoToken}`,
      },
    };

    try {
      const resp: AxiosResponse = await axios.request(options);
      if (resp.status === 200) {
        return true;
      }
      return false;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return error.response?.message;
      }
      throw new Error('Could not delete ArgoCD app.');
    }
  }

  async deleteProject(
    baseUrl: string,
    argoAppName: string,
    argoToken: string,
  ): Promise<boolean> {
    const options: AxiosRequestConfig = {
      method: 'DELETE',
      url: `${baseUrl}/api/v1/projects/${argoAppName}`,
      params: { cascade: 'true' },
      headers: {
        Authorization: `Bearer ${argoToken}`,
      },
    };

    try {
      const resp: AxiosResponse = await axios.request(options);
      if (resp.status === 200) {
        return true;
      }
      return false;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return error.response?.message;
      }
      throw new Error('Could not delete ArgoCD project.');
    }
  }

  async createArgoResources(
    argoInstance: string,
    appName: string,
    projectName: string,
    namespace: string,
    sourceRepo: string,
    sourcePath: string,
    labelValue: string,
    logger: Logger,
  ): Promise<boolean> {
    const argoApps = this.config
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

    logger.info(`Getting app ${appName} on ${argoInstance}`);
    const matchedArgoInstance = argoInstanceArray.find(
      argoHost => argoHost.name === argoInstance,
    );
    if (matchedArgoInstance === undefined) {
      throw new Error('Cannot match argo instance');
    }

    let token: string;
    if (!matchedArgoInstance.token) {
      token = await this.getArgoToken(matchedArgoInstance.url);
    } else {
      token = matchedArgoInstance.token;
    }

    await this.createArgoProject(
      matchedArgoInstance.url,
      token,
      projectName ? projectName : appName,
      namespace,
      sourceRepo,
    );

    await this.createArgoApplication(
      matchedArgoInstance.url,
      token,
      appName,
      projectName ? projectName : appName,
      namespace,
      sourceRepo,
      sourcePath,
      labelValue ? labelValue : appName,
    );

    return true;
  }
}
