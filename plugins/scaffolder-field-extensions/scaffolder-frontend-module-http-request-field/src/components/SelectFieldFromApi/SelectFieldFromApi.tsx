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
import { useState } from 'react';
import FormControl from '@material-ui/core/FormControl';
import {
  BackstageUserIdentity,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
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
import isObject from 'lodash/isObject';
import toPairs from 'lodash/toPairs';
import {
  FieldExtensionComponentProps,
  FieldExtensionUiSchema,
} from '@backstage/plugin-scaffolder-react';

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
  props: FieldExtensionComponentProps<string | string[]> & {
    token?: string;
  } & {
    uiSchema: FieldExtensionUiSchema<string | string[], unknown>;
    identity?: BackstageUserIdentity;
  },
) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [dropDownData, setDropDownData] = useState<SelectItem[] | undefined>();
  const { formContext, uiSchema, identity, formData } = props;
  const isArrayField = props?.schema?.type === 'array';

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
    let init = renderOption(options.params, {
      parameters: formContext.formData,
      identity,
    });

    if (Array.isArray(init)) {
      init = init.reduce((acc, val) => {
        if (isObject(val)) {
          acc.push(toPairs(val).flat());
        } else {
          acc.push(val);
        }
        return acc;
      }, []);
    }
    const params = new URLSearchParams(init);
    const response = await fetchApi.fetch(
      `${baseUrl}${renderOption(options.path, {
        parameters: formContext.formData,
      })}?${params}`,
      { headers },
    );
    if (options.successStatusCode) {
      if (response.status !== options.successStatusCode) {
        throw new Error(
          `Failed to retrieve data from API: ${response.statusText}`,
        );
      }
    } else if (!response.ok) {
      throw new Error(
        `Failed to retrieve data from API: ${response.statusText}`,
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
    const constructedData = array.map((item: Record<string, any>) => {
      let value: string | undefined;
      let label: string | undefined;

      if (options.valueSelector) {
        value = get(
          item,
          renderOption(options.valueSelector, {
            parameters: formContext.formData,
          }),
        );

        if (options.labelTemplate) {
          const renderedLabel = renderString(options.labelTemplate, { item });
          label = renderedLabel || value;
        } else {
          label = options.labelSelector
            ? get(
                item,
                renderOption(options.labelSelector, {
                  parameters: formContext.formData,
                  item,
                }),
              )
            : value;
        }
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
    setDropDownData(
      sortBy(constructedData, item => item.label?.toLowerCase() ?? ''),
    );
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
      error={(props?.rawErrors?.length || 0) > 0 && !formData}
    >
      <Select
        items={dropDownData}
        selected={formData}
        placeholder={placeholder}
        label={title}
        multiple={isArrayField}
        onChange={selected => {
          // The Select component adds the placeholder to the items list and gives it a value of []. This is incompatible
          // with a field of type string, so we need to unset the value in this case.
          props.onChange(
            Array.isArray(selected) && !isArrayField
              ? undefined
              : (selected as string | string[]),
          );
        }}
      />
      <FormHelperText>{description}</FormHelperText>
    </FormControl>
  );
};

const SelectFieldFromApiOauthWrapper = ({
  oauthConfig,
  ...props
}: FieldExtensionComponentProps<string | string[]> & {
  oauthConfig: OAuthConfig;
  identity?: BackstageUserIdentity;
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

export const SelectFieldFromApi = (
  props: FieldExtensionComponentProps<string | string[]>,
) => {
  const identityApi = useApi(identityApiRef);
  const { loading, value: identity } = useAsync(async () => {
    return await identityApi.getBackstageIdentity();
  });
  if (!props.uiSchema) {
    return <ErrorPanel error={new Error('No UI Schema defined')} />;
  }
  const result = selectFieldFromApiConfigSchema.safeParse(
    props.uiSchema['ui:options'],
  );

  if (loading) {
    return <></>;
  }

  if (result.success && result.data.oauth) {
    return (
      <SelectFieldFromApiOauthWrapper
        identity={identity}
        oauthConfig={result.data.oauth}
        {...props}
      />
    );
  }
  return (
    <SelectFieldFromApiComponent
      {...{ ...props, uiSchema: props.uiSchema }}
      identity={identity}
    />
  );
};
