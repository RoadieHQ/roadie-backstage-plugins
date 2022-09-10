import { Config } from '@backstage/config';
import fetch from 'cross-fetch';
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

interface CreateArgoProjectProps {
  baseUrl: string;
  argoToken: string;
  projectName: string;
  namespace: string;
  sourceRepo: string;
  destinationServer?: string;
}

interface CreateArgoApplicationProps {
  baseUrl: string;
  argoToken: string;
  appName: string;
  projectName: string;
  namespace: string;
  sourceRepo: string;
  sourcePath: string;
  labelValue: string;
  destinationServer?: string;
}

interface CreateArgoResourcesProps {
  argoInstance: string;
  appName: string;
  projectName: string;
  namespace: string;
  sourceRepo: string;
  sourcePath: string;
  labelValue: string;
  logger: Logger;
}

interface DeleteProjectProps {
  baseUrl: string;
  argoProjectName: string;
  argoToken: string;
}

interface DeleteApplicationProps {
  baseUrl: string;
  argoApplicationName: string;
  argoToken: string;
}

interface SyncArgoApplicationProps {
  argoInstance: findArgoAppResp;
  argoToken: string;
  appName: string;
}

interface ResyncProps {
  appSelector: string;
}

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
  createArgoProject: (props: CreateArgoProjectProps) => Promise<object>;
  createArgoApplication: (props: CreateArgoApplicationProps) => Promise<object>;
  createArgoResources: (props: CreateArgoResourcesProps) => Promise<boolean>;
  deleteProject: (props: DeleteProjectProps) => Promise<boolean>;
  deleteApp: (props: DeleteApplicationProps) => Promise<boolean>;
  syncArgoApp: (props: SyncArgoApplicationProps) => Promise<SyncResponse>;
  resyncAppOnAllArgos: (props: {
    appSelector: string;
  }) => Promise<SyncResponse[][]>;
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
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `${this.username}`,
        password: `${this.password}`,
      }),
    };
    const resp = await fetch(`${baseUrl}/api/v1/session`, options);
    if (resp.status === 401) {
      throw new Error(`Getting unauthorized for Argo CD instance ${baseUrl}`);
    }
    const data = await resp.json();
    return data.token;
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
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${argoToken}`,
      },
    };
    
    const resp = await fetch(
      `${baseUrl}/api/v1/applications${urlSuffix}`,
      requestOptions,
    );
    if (resp.status === 404) {
      throw new Error('Could not retrieve ArgoCD app data. Application Not Found.');
    }
    const data = await resp?.json();
    if (data.items) {
      (data.items as any[]).forEach(item => {
        item.metadata.instance = { name: argoInstanceName };
      });
    } else if (data && options.name) {
      data.instance = argoInstanceName;
    } else {
      throw new Error('Not found');
    }
    return data;
  }

  async createArgoProject({
    baseUrl,
    argoToken,
    projectName,
    namespace,
    sourceRepo,
    destinationServer,
  }: CreateArgoProjectProps): Promise<object> {
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
              server: destinationServer
                ? destinationServer
                : 'https://kubernetes.default.svc',
            },
          ],
          sourceRepos: [sourceRepo],
        },
      },
    };

    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${argoToken}`,
      },
      body: JSON.stringify(data),
    };
    const resp = await fetch(`${baseUrl}/api/v1/projects`, options);
    const responseData = await resp.json();
    if (resp.status === 403) {
      throw new Error(responseData.message);
    } else if (resp.status === 404) {
      return resp.json();
    } else if (
      JSON.stringify(responseData).includes(
        'existing project spec is different',
      )
    ) {
      throw new Error('Duplicate project detected. Cannot overwrite existing.');
    }
    return responseData;
  }

  async createArgoApplication({
    baseUrl,
    argoToken,
    appName,
    projectName,
    namespace,
    sourceRepo,
    sourcePath,
    labelValue,
    destinationServer,
  }: CreateArgoApplicationProps): Promise<object> {
    const data = {
      metadata: {
        name: appName,
        labels: { 'backstage-name': labelValue },
        finalizers: ['resources-finalizer.argocd.argoproj.io'],
      },
      spec: {
        destination: {
          namespace: namespace,
          server: destinationServer
            ? destinationServer
            : 'https://kubernetes.default.svc',
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

    const options: RequestInit = {
      method: 'POST',
      headers: header,
      body: JSON.stringify(data),
    };

    const resp = await fetch(`${baseUrl}/api/v1/applications`, options);
    if (!resp.ok) {
      throw new Error('Could not create ArgoCD application.');
    }
    return resp.json();
  }

  async resyncAppOnAllArgos({
    appSelector,
  }: ResyncProps): Promise<SyncResponse[][]> {
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
                return this.syncArgoApp({
                  argoInstance,
                  argoToken: token,
                  appName: argoApp,
                });
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

  async syncArgoApp({
    argoInstance,
    argoToken,
    appName,
  }: SyncArgoApplicationProps): Promise<SyncResponse> {
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

    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${argoToken}`,
      },
    };
    const resp = await fetch(
      `${argoInstance.url}/api/v1/applications/${appName}/sync`,
      options,
    );
    if (resp.ok) {
      return {
        status: 'Success',
        message: `Re-synced ${appName} on ${argoInstance.name}`,
      };
    }
    return {
      message: `Failed to resync ${appName} on ${argoInstance.name}`,
      status: 'Failure',
    };
  }

  async deleteApp({
    baseUrl,
    argoApplicationName,
    argoToken,
  }: DeleteApplicationProps): Promise<boolean> {
    const options: RequestInit = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${argoToken}`,
      },
    };

    const resp = await fetch(
      `${baseUrl}/api/v1/applications/${argoApplicationName}?${new URLSearchParams(
        {
          cascade: 'true',
        },
      )}`,
      options,
    );
    const data = await resp?.json();
    if (resp.ok) {
      return true;
    } else if (resp.status === 403 || resp.status === 404) {
      throw new Error(data.message);
    }
    return false;
  }

  async deleteProject({
    baseUrl,
    argoProjectName,
    argoToken,
  }: DeleteProjectProps): Promise<boolean> {
    const options: RequestInit = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${argoToken}`,
      },
    };

    const resp = await fetch(
      `${baseUrl}/api/v1/projects/${argoProjectName}?${new URLSearchParams({
        cascade: 'true',
      })}`,
      options,
    );

    const data = await resp?.json()
    if (resp.ok) {
      return true;
    } else if (resp.status === 403 || resp.status === 404) {
      throw new Error(data.message);
    } else if(data.error && data.message) {
      throw new Error(`Cannot Delete Project: ${data.message}`)
    }
    return false;
  }

  async createArgoResources({
    argoInstance,
    appName,
    projectName,
    namespace,
    sourceRepo,
    sourcePath,
    labelValue,
    logger,
  }: CreateArgoResourcesProps): Promise<boolean> {
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

    await this.createArgoProject({
      baseUrl: matchedArgoInstance.url,
      argoToken: token,
      projectName: projectName ? projectName : appName,
      namespace,
      sourceRepo,
    });

    await this.createArgoApplication({
      baseUrl: matchedArgoInstance.url,
      argoToken: token,
      appName,
      projectName: projectName ? projectName : appName,
      namespace,
      sourceRepo,
      sourcePath,
      labelValue: labelValue ? labelValue : appName,
    });

    return true;
  }
}
