/*
 * Copyright 2020 RoadieHQ
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

import React from 'react';
import Alert from '@material-ui/lab/Alert';
import { Progress, MarkdownContent } from '@backstage/core-components';
import { useGithubFile } from './useGithubFile';

/**
 * Props for Markdown content component {@link Content}.
 *
 * @public
 */
export type MarkdownContentProps = {
  owner: string;
  repo: string;
  path: string;
  branch?: string;
};

/**
 * A component to render a markdown file from github
 *
 * @public
 */
export const Content = (props: MarkdownContentProps) => {
  const { value, loading, error } = useGithubFile(props);
  if (loading) {
    return <Progress />;
  } else if (error) {
    return (
      <Alert severity="error" className={'warning'}>
        {error.message}
      </Alert>
    );
  }

  return (
    <MarkdownContent
      content={Buffer.from(value.content, 'base64').toString('utf8')}
    />
  );
};
