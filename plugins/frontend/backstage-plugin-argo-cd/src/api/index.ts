import {
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import {
  argoCDAppDetails,
  ArgoCDAppDetails,
  argoCDAppList,
  ArgoCDAppList,
  argoCDAppDeployRevisionDetails,
  ArgoCDAppDeployRevisionDetails,
  argoCDServiceList,
  ArgoCDServiceList,
} from '../types';
import { Type as tsType } from 'io-ts';
import {
  decode as tsDecode,
  isDecodeError as tsIsDecodeError,
} from 'io-ts-promise';
import reporter from 'io-ts-reporters';

export interface ArgoCDApi {
  listApps(options: {
    url: string;
    appSelector?: string;
    appNamespace?: string;
    projectName?: string;
  }): Promise<ArgoCDAppList>;
  getRevisionDetails(options: {
    url: string;
    app: string;
    appNamespace?: string;
    revisionID: string;
    instanceName?: string;
  }): Promise<ArgoCDAppDeployRevisionDetails>;
  getAppDetails(options: {
    url: string;
    appName: string;
    appNamespace?: string;
    instance?: string;
  }): Promise<ArgoCDAppDetails>;
  getAppListDetails(options: {
    url: string;
    appSelector: string;
    appNamespace?: string;
    instance?: string;
  }): Promise<ArgoCDAppList>;
  serviceLocatorUrl(options: {
    appName?: string;
    appSelector?: string;
    appNamespace?: string;
  }): Promise<ArgoCDServiceList | Error>;
}

export const argoCDApiRef = createApiRef<ArgoCDApi>({
  id: 'plugin.argocd.service',
});

export type Options = {
  discoveryApi: DiscoveryApi;
  backendBaseUrl: string;
  searchInstances: boolean;
  identityApi: IdentityApi;
  proxyPath?: string;
  useNamespacedApps: boolean;
};

const APP_NAMESPACE_QUERY_PARAM = 'appNamespace';

export class ArgoCDApiClient implements ArgoCDApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly backendBaseUrl: string;
  private readonly searchInstances: boolean;
  private readonly identityApi: IdentityApi;
  private readonly useNamespacedApps: boolean;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.backendBaseUrl = options.backendBaseUrl;
    this.searchInstances = options.searchInstances;
    this.identityApi = options.identityApi;
    this.useNamespacedApps = options.useNamespacedApps;
  }

  async getBaseUrl() {
    if (this.searchInstances) {
      return `${this.backendBaseUrl}/api/argocd`;
    }
    return await this.discoveryApi.getBaseUrl('proxy');
  }

  getQueryParams(params: { [p: string]: string | undefined }) {
    const result = Object.keys(params)
      .filter(key => params[key] !== undefined)
      .filter(
        key => key !== APP_NAMESPACE_QUERY_PARAM || this.useNamespacedApps,
      )
      .map(
        k =>
          `${encodeURIComponent(k)}=${encodeURIComponent(params[k] as string)}`,
      )
      .join('&');
    return result ? `?${result}` : '';
  }

  async fetchDecode<A, O, I>(url: string, typeCodec: tsType<A, O, I>) {
    const { token } = await this.identityApi.getCredentials();
    const response = await fetch(url, {
      headers: token
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
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
    appNamespace?: string;
    projectName?: string;
  }) {
    const proxyUrl = await this.getBaseUrl();
    const query = this.getQueryParams({
      selector: options.appSelector,
      project: options.projectName,
      appNamespace: options.appNamespace,
    });
    return this.fetchDecode(
      `${proxyUrl}${options.url}/applications${query}`,
      argoCDAppList,
    );
  }

  async getRevisionDetails(options: {
    url: string;
    app: string;
    appNamespace?: string;
    revisionID: string;
    instanceName?: string;
  }) {
    const proxyUrl = await this.getBaseUrl();
    const query = this.getQueryParams({
      appNamespace: options.appNamespace,
    });
    if (this.searchInstances) {
      return this.fetchDecode(
        `${proxyUrl}/argoInstance/${
          options.instanceName
        }/applications/name/${encodeURIComponent(
          options.app as string,
        )}/revisions/${encodeURIComponent(
          options.revisionID as string,
        )}/metadata${query}`,
        argoCDAppDeployRevisionDetails,
      );
    }
    return this.fetchDecode(
      `${proxyUrl}${options.url}/applications/${encodeURIComponent(
        options.app as string,
      )}/revisions/${encodeURIComponent(
        options.revisionID as string,
      )}/metadata${query}`,
      argoCDAppDeployRevisionDetails,
    );
  }

  async getAppDetails(options: {
    url: string;
    appName: string;
    appNamespace?: string;
    instance?: string;
  }) {
    const proxyUrl = await this.getBaseUrl();
    const query = this.getQueryParams({
      appNamespace: options.appNamespace,
    });
    if (this.searchInstances) {
      return this.fetchDecode(
        `${proxyUrl}/argoInstance/${
          options.instance
        }/applications/name/${encodeURIComponent(
          options.appName as string,
        )}${query}`,
        argoCDAppDetails,
      );
    }
    return this.fetchDecode(
      `${proxyUrl}${options.url}/applications/${encodeURIComponent(
        options.appName as string,
      )}${query}`,
      argoCDAppDetails,
    );
  }

  async getAppListDetails(options: {
    url: string;
    appSelector: string;
    appNamespace?: string;
    instance?: string;
  }) {
    const proxyUrl = await this.getBaseUrl();
    const query = this.getQueryParams({
      appNamespace: options.appNamespace,
    });
    if (this.searchInstances) {
      return this.fetchDecode(
        `${proxyUrl}/argoInstance/${
          options.instance
        }/applications/selector/${encodeURIComponent(
          options.appSelector as string,
        )}${query}`,
        argoCDAppList,
      );
    }
    return this.fetchDecode(
      `${proxyUrl}${options.url}/applications/selector/${encodeURIComponent(
        options.appSelector as string,
      )}${query}`,
      argoCDAppList,
    );
  }

  async serviceLocatorUrl(options: {
    appName?: string;
    appSelector?: string;
    appNamespace?: string;
  }) {
    if (!options.appName && !options.appSelector) {
      throw new Error('Need to provide appName or appSelector');
    }
    const baseUrl = await this.getBaseUrl();
    const query = this.getQueryParams({
      appNamespace: options.appNamespace,
    });
    const url = options.appName
      ? `${baseUrl}/find/name/${encodeURIComponent(
          options.appName as string,
        )}${query}`
      : `${baseUrl}/find/selector/${encodeURIComponent(
          options.appSelector as string,
        )}${query}`;

    return this.fetchDecode(url, argoCDServiceList).catch(_ => {
      throw new Error('Cannot get argo location(s) for service');
    });
  }
}
