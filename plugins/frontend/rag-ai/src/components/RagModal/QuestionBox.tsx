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

/* eslint-disable jsx-a11y/no-autofocus */

import { ChangeEvent, KeyboardEvent, useCallback, useState } from 'react';
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core';
import LooksIcon from '@material-ui/icons/Looks';

export const QuestionBox = (props: {
  onSubmit: (query: string, source: string) => {};
  onClear: () => void;
  fullWidth: boolean;
}) => {
  const { onSubmit = () => {}, fullWidth = true, onClear } = props;
  const [label, setLabel] = useState('Ask the LLM');
  const [value, setValue] = useState<string>('');
  const [source, setSource] = useState<string>('all');

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (label === 'Ask the LLM') {
        setLabel('ctrl+enter to ask');
      }
      setValue(e.target.value);
    },
    [setValue, label],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.ctrlKey && e.key === 'Enter') {
        onSubmit(value, source);
      }
    },
    [onSubmit, value, source],
  );

  const handleClear = useCallback(() => {
    setValue('');
    setLabel('Ask the LLM');
    onClear();
  }, [onClear]);

  const ariaLabel: string | undefined = 'Ask the LLM';

  const startAdornment = (
    <InputAdornment position="start">
      <IconButton aria-label="Query" size="small" disabled>
        <LooksIcon />
      </IconButton>
    </InputAdornment>
  );

  const clearButtonEndAdornment = (
    <InputAdornment position="end">
      <Button
        aria-label="Clear"
        size="small"
        onClick={handleClear}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.stopPropagation();
          }
        }}
      >
        Clear
      </Button>
    </InputAdornment>
  );

  return (
    <Grid container justifyContent="center" alignItems="center">
      <Grid item xs={11}>
        <TextField
          autoFocus
          multiline
          minRows={1}
          id="llm-bar-text-field"
          data-testid="llm-bar-next"
          variant="outlined"
          margin="normal"
          value={value}
          label={label}
          placeholder="What would you like to know?"
          InputProps={{
            startAdornment,
            endAdornment: clearButtonEndAdornment,
          }}
          inputProps={{
            'aria-label': ariaLabel,
          }}
          fullWidth={fullWidth}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </Grid>
      <Grid item xs={1}>
        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={() => onSubmit(value, source)}
        >
          Ask
        </Button>
      </Grid>
      <Grid item xs={12}>
        <FormControl variant="outlined" fullWidth margin="dense">
          <InputLabel id="question-box-source">Source</InputLabel>
          <Select
            labelId="question-box-source"
            value={source}
            label="Source"
            onChange={e => setSource(e.target.value as string)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="catalog">Catalog</MenuItem>
            <MenuItem value="tech-docs">TechDocs</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};
