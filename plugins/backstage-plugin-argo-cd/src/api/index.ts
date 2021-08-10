import { createApiRef, DiscoveryApi } from '@backstage/core-plugin-api';
import {
  argoCDAppDetails,
  ArgoCDAppDetails,
  argoCDAppList,
  ArgoCDAppList,
} from '../types';
import { Type as tsType } from 'io-ts';
import { decode as tsDecode, isDecodeError as tsIsDecodeError } from 'io-ts-promise';
import reporter from 'io-ts-reporters';

export interface ArgoCDApi {
  listApps(options: {
    url: string;
    appSelector?: string;
    projectName?: string;
  }): Promise<ArgoCDAppList>;
  getAppDetails(options: {
    url: string;
    appName: string;
  }): Promise<ArgoCDAppDetails>;
}

export const argoCDApiRef = createApiRef<ArgoCDApi>({
  id: 'plugin.argocd.service',
  description: 'Used by the ArgoCD plugin to make requests',
});

export type Options = {
  discoveryApi: DiscoveryApi;
  proxyPath?: string;
};

export class ArgoCDApiClient implements ArgoCDApi {
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
  }

  private async getProxyUrl() {
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
    const proxyUrl = await this.getProxyUrl();
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

  async getAppDetails(options: { url: string; appName: string }) {
    const proxyUrl = await this.getProxyUrl();
    return this.fetchDecode(
      `${proxyUrl}${options.url}/applications/${options.appName}`,
      argoCDAppDetails,
    );
  }
}
