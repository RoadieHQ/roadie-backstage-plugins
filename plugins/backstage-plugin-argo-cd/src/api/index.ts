import {
  createApiRef,
  DiscoveryApi,
} from '@backstage/core-plugin-api';
import {
  argoCDAppDetails,
  ArgoCDAppDetails,
  argoCDAppList,
  ArgoCDAppList,
} from '../types';
import { Type as tsType } from 'io-ts';
import {
  decode as tsDecode,
  isDecodeError as tsIsDecodeError,
} from 'io-ts-promise';
import reporter from 'io-ts-reporters';
import { Entity } from '@backstage/catalog-model';

export interface ArgoCDApi {
  listApps(options: {
    url: string;
    appSelector?: string;
    projectName?: string;
  }): Promise<ArgoCDAppList>;
  getAppDetails(options: {
    url: string;
    appName: string;
    cluster?: string;
  }): Promise<ArgoCDAppDetails>;
  kubernetesServiceLocator(
    serviceName: string,
    entity: Entity,
  ): Promise<Array<string>>;
}

export const argoCDApiRef = createApiRef<ArgoCDApi>({
  id: 'plugin.argocd.service',
  description: 'Used by the ArgoCD plugin to make requests',
});

export type Options = {
  discoveryApi: DiscoveryApi;
  backendBaseUrl: string;
  perCluster: boolean;
  proxyPath?: string;
};

export class ArgoCDApiClient implements ArgoCDApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly backendBaseUrl: string;
  private readonly perCluster: boolean;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.backendBaseUrl = options.backendBaseUrl;
    this.perCluster = options.perCluster;
  }

  private async getBaseUrl() {
    if (this.perCluster === true) {
      return `${this.backendBaseUrl}/api/argocd`;
    }
    return await this.discoveryApi.getBaseUrl('proxy');
  }

  private async fetchDecode<A, O, I>(url: string, typeCodec: tsType<A, O, I>) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    const json = await response.json();
    try {
      return await tsDecode(typeCodec, json);
    } catch (e) {
      if (tsIsDecodeError(e)) {
        throw new Error(
          `remote data validation failed: ${reporter
            .report(typeCodec.decode(json))
            .join('; ')}`,
        );
      } else {
        throw e;
      }
    }
  }

  async listApps(options: {
    url: string;
    appSelector?: string;
    projectName?: string;
  }) {
    const proxyUrl = await this.getBaseUrl();
    const params: { [key: string]: string | undefined } = {
      selector: options.appSelector,
      project: options.projectName,
    };
    const query = Object.keys(params)
      .filter(key => params[key] !== undefined)
      .map(
        k =>
          `${encodeURIComponent(k)}=${encodeURIComponent(params[k] as string)}`,
      )
      .join('&');
    return this.fetchDecode(
      `${proxyUrl}${options.url}/applications?${query}`,
      argoCDAppList,
    );
  }

  async getAppDetails(options: {
    url: string;
    appName: string;
    cluster?: string;
  }) {
    const proxyUrl = await this.getBaseUrl();
    if (this.perCluster === true) {
      return await this.fetchDecode(
        `${proxyUrl}/clusters/${options.cluster}/applications/${options.appName}`,
        argoCDAppDetails,
      );
    }
    return this.fetchDecode(
      `${proxyUrl}${options.url}/applications/${options.appName}`,
      argoCDAppDetails,
    );
  }

  async kubernetesServiceLocator(serviceName: string, entity: Entity) {
    const entityString = JSON.stringify(entity);
    return fetch(
      `${this.backendBaseUrl}/api/kubernetes/services/${serviceName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: `\{\"entity\": ${entityString} \}`,
      },
    )
      .then(async response => {
        const resp = await response.json();
        return resp.items.map((element: any) => {
          return element.cluster.name;
        });
      })
      .catch(err => {
        console.error(err);
        throw new Error('Cannot get clusters for service');
      });
  }
}
