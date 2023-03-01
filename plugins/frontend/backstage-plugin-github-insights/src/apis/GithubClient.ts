/*
 * Copyright 2022 Larder Software Limited
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

import { GithubApi } from './GithubApi';
import { ErrorApi, OAuthApi } from '@backstage/core-plugin-api';
import { Octokit } from '@octokit/rest';

const mimeTypeMap: Record<string, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
};

const mimeTypeLookup = (href: string): string | undefined => {
  const match = href.match(/\.([a-zA-Z]*)$/);
  const extension = match ? match[1] : undefined;
  return extension ? mimeTypeMap[extension.toLowerCase()] : undefined;
};

const getRepositoryDefaultBranch = (url: string) => {
  return new URL(url).searchParams.get('ref');
};

const defaultBaseUrl = 'https://api.github.com';

export class GithubClient implements GithubApi {
  private githubAuthApi: OAuthApi;
  private errorApi: ErrorApi;

  constructor(deps: { githubAuthApi: OAuthApi; errorApi: ErrorApi }) {
    this.githubAuthApi = deps.githubAuthApi;
    this.errorApi = deps.errorApi;
  }

  async getContent(props: {
    baseUrl?: string;
    owner: string;
    repo: string;
    branch?: string;
    path?: string;
  }): Promise<{
    content: string;
    media: Record<string, string>;
    links: Record<string, string>;
  }> {
    const { path, repo, owner, branch, baseUrl = defaultBaseUrl } = props;
    const token = await this.githubAuthApi.getAccessToken();
    const octokit = new Octokit({ auth: token, baseUrl });
    let query = 'readme';
    if (path) {
      query = `contents/${path}`;
    }
    const response = await octokit.request(
      `GET /repos/{owner}/{repo}/${query}`,
      {
        owner,
        repo,
        ...(branch && { ref: branch }),
      },
    );
    const content = Buffer.from(response.data.content, 'base64').toString(
      'utf8',
    );

    const mediaLinks = [
      ...content.matchAll(
        /\[([^\[\]]*)\]\((.*?)(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.svg)(.*)\)/gim,
      ),
    ].map(match => [match[2], match[3]].join(''));

    const media: Record<string, string> = {};

    for (const href of mediaLinks) {
      const mimeType = mimeTypeLookup(href);
      const url = new URL(href, response.data.url);

      if (mimeType && url.host.includes('github.com')) {
        const requestPath = url.pathname.replace(
          new RegExp(`/${owner}/${repo}/blob/(main|master)`),
          `/repos/${owner}/${repo}/contents`,
        );
        try {
          const contentResponse = await octokit.request(`GET ${requestPath}`);
          media[
            href
          ] = `data:${mimeType};base64,${contentResponse.data.content.replaceAll(
            '\n',
            '',
          )}`;
        } catch (e: any) {
          this.errorApi.post(e);
        }
      }
    }

    const markdownLinks = [
      ...content.matchAll(/\[([^\[\]]*)\]\((?!https?:\/\/)(.*?)(\.md)\)/gim),
    ].map(match => [match[2], match[3]].join(''));

    const links: Record<string, string> = {};
    for (const markdownLink of markdownLinks) {
      links[markdownLink] = `https://github.com/${owner}/${repo}/blob/${
        branch || getRepositoryDefaultBranch(response.data.url)
      }/${markdownLink}`;
    }
    return { content, media, links };
  }
}
