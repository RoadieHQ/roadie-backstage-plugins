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

export interface CreateArgoProjectProps {
  baseUrl: string;
  argoToken: string;
  projectName: string;
  namespace: string;
  sourceRepo: string;
  destinationServer?: string;
}

export interface CreateArgoApplicationProps {
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

export interface CreateArgoResourcesProps {
  argoInstance: string;
  appName: string;
  projectName: string;
  namespace: string;
  sourceRepo: string;
  sourcePath: string;
  labelValue: string;
  logger: Logger;
}

export interface DeleteProjectProps {
  baseUrl: string;
  argoProjectName: string;
  argoToken: string;
}

export interface DeleteApplicationProps {
  baseUrl: string;
  argoApplicationName: string;
  argoToken: string;
}

export interface SyncArgoApplicationProps {
  argoInstance: findArgoAppResp;
  argoToken: string;
  appName: string;
}

export interface ResyncProps {
  appSelector: string;
}

export interface ArgoServiceApi {
  getArgoToken: (appConfig: {
    url: string;
    username?: string;
    password?: string;
  }) => Promise<string>;
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
