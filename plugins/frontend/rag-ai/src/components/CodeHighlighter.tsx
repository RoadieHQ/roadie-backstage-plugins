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
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import {
  oneLight,
  oneDark,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, useTheme } from '@material-ui/core';

SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('json', json);

const CodeHighlighter = ({
  text,
  language = 'yaml',
  showLineNumbers = true,
}: {
  text: string;
  language: string;
  showLineNumbers?: boolean;
}) => {
  const theme = useTheme();

  return (
    <Box maxHeight="20em" overflow="scroll">
      <SyntaxHighlighter
        language={language}
        style={theme.palette.type === 'light' ? oneLight : oneDark}
        showLineNumbers={showLineNumbers}
        children={text}
      />
    </Box>
  );
};

export { CodeHighlighter };
