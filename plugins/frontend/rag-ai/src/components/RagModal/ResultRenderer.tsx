/*
 * Copyright 2024 Larder Software Limited
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
import { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Box } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { CodeHighlighter } from '../CodeHighlighter';

const useStyles = makeStyles(theme => ({
  markdown: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
  code: {
    whiteSpace: 'pre-wrap',
    padding: '2px 4px',
    borderRadius: '4px',
    backgroundColor: theme.palette.type === 'light' ? '#f4f4f4' : '#2a2a2a',
    border:
      theme.palette.type === 'light' ? '1px solid #ddd' : '1px solid #444',
    '&:not(pre > &)': {
      backgroundColor: theme.palette.type === 'light' ? '#f4f4f4' : '#333333',
      border:
        theme.palette.type === 'light' ? '1px solid #ddd' : '1px solid #444',
    },
  },
  boxContainer: {
    padding: '1rem',
  },
  link: {
    textDecoration: 'revert-layer',
  },
}));

const LinkRenderer = ({
  href,
  children,
}: {
  href?: string;
  children: ReactNode;
}) => {
  const classes = useStyles();

  return (
    <a href={href} target="_blank" rel="noreferrer" className={classes.link}>
      {children}
    </a>
  );
};

export const ResultRenderer = ({ result }: { result: string }) => {
  const classes = useStyles();
  if (!result) {
    return null;
  }
  return (
    <Box p={3} className={`${classes.markdown} markdown-body`}>
      <ReactMarkdown
        children={result}
        components={{
          code(props) {
            const { children, className, node, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');

            return match ? (
              <CodeHighlighter
                text={String(children)}
                language={match[1]}
                showLineNumbers={false}
              />
            ) : (
              <Box p={1} className={classes.code}>
                <code {...rest} className={className}>
                  {children}
                </code>
              </Box>
            );
          },
          a(props) {
            return <LinkRenderer {...props} />;
          },
        }}
      />
    </Box>
  );
};
