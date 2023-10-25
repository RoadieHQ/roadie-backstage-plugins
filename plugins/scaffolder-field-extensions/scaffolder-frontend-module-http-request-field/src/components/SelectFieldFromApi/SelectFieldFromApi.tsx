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
import { FieldProps } from '@rjsf/core';
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

const SelectFieldFromApiComponent = (
  props: FieldProps<string> & { token?: string },
) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [dropDownData, setDropDownData] = useState<SelectItem[] | undefined>();
  const optionsParsingState = selectFieldFromApiConfigSchema.safeParse(
    props.uiSchema['ui:options'],
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
    const params = new URLSearchParams(options.params);
    const response = await fetchApi.fetch(
      `${baseUrl}${options.path}?${params}`,
      { headers },
    );
    const body = await response.json();
    const array = options.arraySelector
      ? get(body, options.arraySelector)
      : body;
    const constructedData = array.map((item: unknown) => {
      let value: string | undefined;
      let label: string | undefined;

      if (options.valueSelector) {
        value = get(item, options.valueSelector);
        label = options.labelSelector
          ? get(item, options.labelSelector)
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

  const { title = 'Select', description = '' } = optionsParsingState.success
    ? optionsParsingState.data
    : {};
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
      error={props.rawErrors?.length > 0 && !props.formData}
    >
      <Select
        items={dropDownData}
        label={title}
        onChange={props.onChange}
        native
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

  return <SelectFieldFromApiComponent {...props} token={token} />;
};

export const SelectFieldFromApi = (props: FieldProps<string>) => {
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
  return <SelectFieldFromApiComponent {...props} />;
};
