/*
 * Copyright 2025 Larder Software Limited
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

import { useCallback } from 'react';
import { Alert } from '@material-ui/lab';
import {
  MarkdownContent as RawMarkdownContent,
  Progress,
} from '@backstage/core-components';
import {
  ApiHolder,
  configApiRef,
  useApiHolder,
} from '@backstage/core-plugin-api';
import { MarkdownContentProps } from './types';
import useAsync from 'react-use/lib/useAsync';
import { GithubApi, githubApiRef, GithubClient } from '../../../apis';
import { scmAuthApiRef } from '@backstage/integration-react';
import { GitHubAuthorizationWrapper } from '@roadiehq/github-auth-utils-react';

const getGithubClient = (apiHolder: ApiHolder) => {
  let githubClient: GithubApi | undefined = apiHolder.get(githubApiRef);
  if (!githubClient) {
    const configApi = apiHolder.get(configApiRef);
    const scmAuthApi = apiHolder.get(scmAuthApiRef);
    if (scmAuthApi && configApi) {
      githubClient = new GithubClient({ configApi, scmAuthApi });
    }
  }
  if (!githubClient) {
    throw new Error(
      'The MarkdownCard component Failed to get the SCM auth client or SCM configuration',
    );
  }
  return githubClient;
};

const GithubFileContent = (props: MarkdownContentProps) => {
  const { preserveHtmlComments } = props;
  const apiHolder = useApiHolder();

  const { value, loading, error } = useAsync(async () => {
    const githubClient = getGithubClient(apiHolder);
    return githubClient.getContent({ ...props });
  }, [apiHolder]);

  const transformImageUri = useCallback(
    (href: string) => {
      return value?.media[href] || href;
    },
    [value?.media],
  );

  const transformLinkUri = useCallback(
    (href: string) => {
      return value?.links[href] || href;
    },
    [value?.links],
  );

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (!value) {
    return <Progress />;
  }

  let content = value.content;
  if (!preserveHtmlComments) {
    content = content.replace(/<!--(.|\n)*?-->/g, '');
  }

  return (
    <RawMarkdownContent
      transformImageUri={transformImageUri}
      transformLinkUri={transformLinkUri}
      content={content}
    />
  );
};

/**
 * A component to render a markdown file from github
 *
 * @public
 */
const MarkdownContent = (props: MarkdownContentProps) => {
  const { hostname } = props;
  return (
    <GitHubAuthorizationWrapper title="Markdown Card" hostname={hostname}>
      <GithubFileContent {...props} />
    </GitHubAuthorizationWrapper>
  );
};

export default MarkdownContent;
