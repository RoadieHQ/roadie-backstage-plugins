/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { useUrl } from "./useUrl";
import { GitHubIntegrationConfig } from "../types";

const createGitHubEntity = (originHost: string) => {
  return {
    entity: {
      metadata: {
        namespace: 'default',
        annotations: {
          'github.com/project-slug': 'company/sample-service',
          'backstage.io/managed-by-location': `url:https://${originHost}/sample-service/blob/master/catalog-info.yaml`
        },
        name: 'sample-service',
        description: 'Sample service'
      },
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      spec: {
        type: 'service',
        lifecycle: 'experimental',
      },
    },
  };
}

const enterpriseGithub = {
  host: "git.company.com",
  apiBaseUrl: "https://git.company.com/api/v3",
  rawBaseUrl: "https://raw.git.company.com"
};

const github = {
  host: "github.com",
  apiBaseUrl: "https://api.github.com",
  rawBaseUrl: "https://raw.github.com"
};

const getValueFromConfig = (config: GitHubIntegrationConfig, key: string) => {
  // @ts-ignore
  return config[ key ]
}

const config = {
  getOptionalConfigArray: (_: string) => [
    {getOptionalString: (key: string) => getValueFromConfig(github, key)},
    {getOptionalString: (key: string) => getValueFromConfig(enterpriseGithub, key)}
  ],
};

jest.mock('@backstage/core-plugin-api', () => ({
  useApi: () => {
    return config;
  }
}));

describe('useUrl', () => {

  it('should get github enterprise URL based on the catalog entity location', () => {

    const githubEnterpriseEntity = createGitHubEntity('git.company.com');
    const urlInfo = useUrl(githubEnterpriseEntity.entity);

    expect(urlInfo).toBeDefined();
    expect(urlInfo?.hostname).toBe(enterpriseGithub.host);
    expect(urlInfo?.baseUrl).toBe(enterpriseGithub.apiBaseUrl);
  });

  it('should get github URL based on the catalog entity location', () => {

    const gitHubEntity = createGitHubEntity('github.com');
    const urlInfo = useUrl(gitHubEntity.entity);

    expect(urlInfo).toBeDefined();
    expect(urlInfo?.hostname).toBe(github.host);
    expect(urlInfo?.baseUrl).toBe(github.apiBaseUrl);
  });

  it('should get default github URL', () => {

    const gitLabEntity = createGitHubEntity('gitlab.com');
    const urlInfo = useUrl(gitLabEntity.entity);

    expect(urlInfo).toBeDefined();
    expect(urlInfo?.hostname).toBe(github.host);
    expect(urlInfo?.baseUrl).toBe(github.apiBaseUrl);
  });
});
