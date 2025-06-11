import { Config } from '@backstage/config';
import type { Logger } from 'winston';
import { LoggerService } from '@backstage/backend-plugin-api';

export type getRevisionDataResp = {
  author: string;
  date: string;
  message: string;
};

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

export interface UpdateArgoProjectProps {
  baseUrl: string;
  argoToken: string;
  projectName: string;
  namespace: string;
  sourceRepo: string | string[];
  resourceVersion: string;
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

export interface UpdateArgoApplicationProps extends CreateArgoApplicationProps {
  resourceVersion: string;
}

export interface CreateArgoResourcesProps {
  argoInstance: string;
  appName: string;
  projectName: string;
  namespace: string;
  sourceRepo: string;
  sourcePath: string;
  labelValue: string;
  logger: Logger | LoggerService;
}

export interface UpdateArgoProjectAndAppProps {
  instanceConfig: InstanceConfig;
  argoToken: string;
  appName: string;
  projectName: string;
  namespace: string;
  sourceRepo: string;
  sourcePath: string;
  labelValue: string;
  destinationServer?: string;
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

export interface DeleteApplicationAndProjectProps {
  argoAppName: string;
  argoInstanceName: string;
  terminateOperation?: boolean;
}

export type DeleteApplicationAndProjectResponse = {
  terminateOperationDetails?: ResponseSchema<DeleteResponse> | undefined;
  deleteAppDetails:
    | ResponseSchema<DeleteResponse | ArgoApplication>
    | undefined;
  deleteProjectDetails:
    | ResponseSchema<DeleteResponse>
    | ResponseSchemaUnknown
    | undefined;
};

type status = 'pending' | 'success' | 'failed';

export type ResponseSchema<T> = {
  status: Exclude<status, 'unknown'>;
  message: string;
  argoResponse: T;
};

type ResponseSchemaUnknown = {
  status: Extract<status, 'failed'>;
  message: string;
  argoResponse: Record<string, never>;
};

export interface SyncArgoApplicationProps {
  argoInstance: findArgoAppResp;
  argoToken: string;
  appName: string;
}

export interface ResyncProps {
  appSelector: string;
  terminateOperation?: boolean;
}

export interface ArgoServiceApi {
  getArgoInstanceArray: () => InstanceConfig[];
  getAppArray: () => Config[];
  getArgoToken: (
    appConfig: InstanceConfig,
    azureCredentials?: AzureConfig,
  ) => Promise<string>;
  getArgoAppData: (
    baseUrl: string,
    argoInstanceName: string,
    argoToken: string,
    options?: {
      name?: string;
      selector?: string;
      namespace?: string;
    },
  ) => Promise<{ items: any[] }>;
  createArgoProject: (props: CreateArgoProjectProps) => Promise<object>;
  createArgoApplication: (props: CreateArgoApplicationProps) => Promise<object>;
  createArgoResources: (props: CreateArgoResourcesProps) => Promise<boolean>;
  deleteProject: (props: DeleteProjectProps) => Promise<DeleteResponse>;
  deleteApp: (props: DeleteApplicationProps) => Promise<DeleteResponse>;
  deleteAppandProject: (
    props: DeleteApplicationAndProjectProps,
  ) => Promise<DeleteApplicationAndProjectResponse>;
  syncArgoApp: (props: SyncArgoApplicationProps) => Promise<SyncResponse>;
  resyncAppOnAllArgos: (props: {
    appSelector: string;
    terminateOperation: boolean;
  }) => Promise<SyncResponse[][]>;
  findArgoApp: (options: {
    name?: string;
    selector?: string;
    namespace?: string;
  }) => Promise<findArgoAppResp[]>;
  updateArgoProjectAndApp: (
    props: UpdateArgoProjectAndAppProps,
  ) => Promise<boolean>;
  getArgoProject: (props: GetArgoProjectProps) => Promise<GetArgoProjectResp>;
  getArgoApplicationInfo: (
    props: getArgoApplicationInfoProps,
  ) => Promise<GetArgoApplication>;
  terminateArgoAppOperation: (
    props: terminateArgoAppOperationProps,
  ) => Promise<DeleteResponse>;
  getRevisionData: (
    baseUrl: string,
    options: {
      name: string;
      namespace?: string;
      sourceIndex?: string;
    },
    argoToken: string,
    revisionID: string,
  ) => Promise<getRevisionDataResp>;
}

export type OIDCConfig = {
  provider: 'azure';
  providerConfigKey: string;
};

export type InstanceConfig = {
  name: string;
  password?: string;
  token?: string;
  url: string;
  username?: string;
};

export type AzureConfig = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  loginUrl: string;
};

export type BuildArgoProjectArgs = {
  projectName: string;
  namespace: string;
  sourceRepo: string | string[];
  resourceVersion?: string;
  destinationServer?: string;
  clusterResourceBlacklist?: ResourceItem[];
  clusterResourceWhitelist?: ResourceItem[];
};

export type BuildArgoApplicationArgs = {
  appName: string;
  projectName: string;
  namespace: string;
  sourceRepo: string;
  sourcePath: string;
  labelValue: string;
  resourceVersion?: string;
  destinationServer?: string;
};

export type GetArgoProjectProps = {
  baseUrl: string;
  argoToken: string;
  projectName: string;
};

// Many more fields available, can be added as needed
export type GetArgoProjectResp = {
  metadata: {
    resourceVersion: string;
  };
};

export type FetchResponse<T, N> = Omit<Response, 'json' | 'status'> & {
  status: N;
  json: () => Promise<T>;
};

type HttpStatusCodes = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 500; // list goes on and on for all possible http status code

export type ArgoErrorResponse = {
  message: string;
  error: string;
  code: number;
};

export type DeleteResponse =
  | (ArgoErrorResponse & { statusCode: Exclude<HttpStatusCodes, 200> })
  | { statusCode: 200 };

type GetArgoApplication =
  | (ArgoErrorResponse & { statusCode: Exclude<HttpStatusCodes, 200> })
  | (ArgoApplication & { statusCode: 200 });

export type GetArgoApplicationFetchResponse =
  | FetchResponse<ArgoErrorResponse, Exclude<HttpStatusCodes, 200>>
  | FetchResponse<ArgoApplication, 200>;

export type TerminateArgoAppOperationFetchResponse =
  | FetchResponse<ArgoErrorResponse, Exclude<HttpStatusCodes, 200>>
  | FetchResponse<Record<string, never>, 200>;

export type DeleteArgoAppFetchResponse =
  | FetchResponse<ArgoErrorResponse, Exclude<HttpStatusCodes, 200>>
  | FetchResponse<Record<string, never>, 200>;

export type DeleteArgoProjectFetchResponse =
  | FetchResponse<ArgoErrorResponse, Exclude<HttpStatusCodes, 200>>
  | FetchResponse<Record<string, never>, 200>;

export type ArgoProject = {
  metadata: Metadata;
  spec: ArgoProjectSpec;
};

export type ArgoApplication = {
  metadata: Metadata;
};

export type Destination = {
  name: string;
  namespace: string;
  server: string;
};

export type ArgoProjectSpec = {
  destinations: Destination[];
  sourceRepos: string[];
  clusterResourceBlacklist?: ResourceItem[];
  clusterResourceWhitelist?: ResourceItem[];
  namespaceResourceBlacklist?: ResourceItem[];
  namespaceResourceWhitelist?: ResourceItem[];
};

export type Metadata = {
  name: string;
  namespace?: string;
  uid?: string;
  creationTimestamp?: string;
  deletionTimestamp?: string;
  deletionGracePeriodSeconds?: number;
  resourceVersion?: string;
  finalizers?: string[];
};

export type ResourceItem = {
  group: string;
  kind: string;
};

export type getArgoApplicationInfoProps =
  | {
      argoApplicationName: string;
      argoInstanceName: string;
    }
  | {
      argoApplicationName: string;
      baseUrl: string;
      argoToken: string;
    };

export type terminateArgoAppOperationProps =
  | {
      argoAppName: string;
      argoInstanceName: string;
    }
  | {
      argoAppName: string;
      baseUrl: string;
      argoToken: string;
    };
