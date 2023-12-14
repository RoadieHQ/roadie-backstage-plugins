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
import React, { useState } from 'react';
import { FieldProps, UiSchema } from '@rjsf/utils';
import FormControl from '@material-ui/core/FormControl';
import {
  discoveryApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import {
  ErrorPanel,
  Progress,
  Select,
  SelectItem,
} from '@backstage/core-components';
import { useAsync } from 'react-use';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import { OAuthConfig, selectFieldFromApiConfigSchema } from '../../types';
import { Box, Button, FormHelperText, Typography } from '@material-ui/core';
import { useOauthSignIn } from '../../hooks/useOauthSignIn';
import { renderString } from 'nunjucks';
import fromPairs from 'lodash/fromPairs';

const renderOption = (input: any, context: object): any => {
  if (!input) {
    return input;
  }
  if (typeof input === 'string') {
    return renderString(input, context);
  }
  if (Array.isArray(input)) {
    return input.map(item => renderOption(item, context));
  }
  if (typeof input === 'object') {
    return fromPairs(
      Object.keys(input).map(key => [
        key as keyof typeof input,
        renderOption(input[key], context),
      ]),
    );
  }
  return input;
};

const SelectFieldFromApiComponent = (
  props: FieldProps<string> & { token?: string } & {
    uiSchema: UiSchema<string>;
  },
) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [dropDownData, setDropDownData] = useState<SelectItem[] | undefined>();
  const { formContext, uiSchema } = props;

  const optionsParsingState = selectFieldFromApiConfigSchema.safeParse(
    uiSchema['ui:options'],
  );

  const { error } = useAsync(async () => {
    if (!optionsParsingState.success) {
      throw optionsParsingState.error;
    }
    const options = optionsParsingState.data;
    const baseUrl = await discoveryApi.getBaseUrl('');
    const headers: Record<string, string> = {};

    if (props.token) {
      headers.Authorization = `Bearer ${props.token}`;
    }
    const params = new URLSearchParams(
      renderOption(options.params, { parameters: formContext.formData }),
    );
    const response = await fetchApi.fetch(
      `${baseUrl}${renderOption(options.path, {
        parameters: formContext.formData,
      })}?${params}`,
      { headers },
    );
    if (!response.ok) {
      throw new Error(
        `Failed to populate SelectFieldFromApi dropdown due to error retrieving from ${options.path}: ${response.statusText}`,
      );
    }
    const body = await response.json();
    const array = options.arraySelector
      ? get(
          body,
          renderOption(options.arraySelector, {
            parameters: formContext.formData,
          }),
        )
      : body;
    const constructedData = array.map((item: unknown) => {
      let value: string | undefined;
      let label: string | undefined;

      if (options.valueSelector) {
        value = get(
          item,
          renderOption(options.valueSelector, {
            parameters: formContext.formData,
          }),
        );
        label = options.labelSelector
          ? get(
              item,
              renderOption(options.labelSelector, {
                parameters: formContext.formData,
              }),
            )
          : value;
      } else {
        if (!(typeof item === 'string')) {
          throw new Error(
            `The item provided for the select drop down "${item}" is not a string`,
          );
        }
        value = item;
        label = item;
      }

      if (!value) {
        throw new Error(`Failed to populate SelectFieldFromApi dropdown`);
      }

      return {
        value,
        label: label || value,
      };
    });
    setDropDownData(sortBy(constructedData, 'label'));
  });

  const {
    title = 'Select',
    description = '',
    placeholder = 'Select from results',
  } = optionsParsingState.success ? optionsParsingState.data : {};
  if (error) {
    return <ErrorPanel error={error} />;
  }

  if (!dropDownData) {
    return <Progress />;
  }
  return (
    <FormControl
      margin="normal"
      required={props.required}
      error={(props?.rawErrors?.length || 0) > 0 && !props.formData}
    >
      <Select
        items={dropDownData}
        placeholder={placeholder}
        label={title}
        onChange={selected => props.onChange(selected as string)}
      />
      <FormHelperText>{description}</FormHelperText>
    </FormControl>
  );
};

const SelectFieldFromApiOauthWrapper = ({
  oauthConfig,
  ...props
}: FieldProps<string> & {
  oauthConfig: OAuthConfig;
}) => {
  const { token, loading, error, isSignedIn, showSignInModal } =
    useOauthSignIn(oauthConfig);

  if (loading && !isSignedIn) {
    return <Progress />;
  }
  if (error) {
    return <ErrorPanel error={error} />;
  }

  if (!props.uiSchema) {
    return <ErrorPanel error={new Error('No UI Schema defined')} />;
  }

  if (!isSignedIn || !token) {
    return (
      <Box height="100%" width="100%">
        <Box>
          <Typography variant="body2">
            <b>{props.uiSchema['ui:options']?.title || props.name}</b>
          </Typography>
        </Box>
        <Box display="flex">
          <Box paddingRight={1}>
            <Typography>
              This input requires authentication with {oauthConfig.provider}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={showSignInModal}
              size="small"
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <SelectFieldFromApiComponent
      {...{ ...props, uiSchema: props.uiSchema }}
      token={token}
    />
  );
};

export const SelectFieldFromApi = (props: FieldProps<string>) => {
  if (!props.uiSchema) {
    return <ErrorPanel error={new Error('No UI Schema defined')} />;
  }
  const result = selectFieldFromApiConfigSchema.safeParse(
    props.uiSchema['ui:options'],
  );
  if (result.success && result.data.oauth) {
    return (
      <SelectFieldFromApiOauthWrapper
        oauthConfig={result.data.oauth}
        {...props}
      />
    );
  }
  return (
    <SelectFieldFromApiComponent {...{ ...props, uiSchema: props.uiSchema }} />
  );
};
