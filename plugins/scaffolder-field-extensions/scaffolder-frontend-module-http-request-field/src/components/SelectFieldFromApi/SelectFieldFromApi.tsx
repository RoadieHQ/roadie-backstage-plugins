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
import React, { useEffect, useState } from 'react';
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
import { selectFieldFromApiConfigSchema } from '../../types';
import { FormHelperText } from '@material-ui/core';
import jsonata from 'jsonata';

export const SelectFieldFromApi = (props: FieldProps<string>) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [dropDownData, setDropDownData] = useState<SelectItem[] | undefined>();
  const [paramValue, setParamValue] = useState<string | undefined>(undefined);
  const [paramKey, setParamKey] = useState<string | undefined>(undefined);
  const [pathExtension, setPathExtension] = useState<string | undefined>(
    undefined,
  );
  const [jsonataLookupExpression, setJsonataLookupExpression] = useState<
    string | undefined
  >(undefined);

  const options = selectFieldFromApiConfigSchema.parse(
    props.uiSchema['ui:options'],
  );
  const {
    title = 'Select',
    description = '',
    valueSelector,
    labelSelector,
    arraySelector,
    params,
    path,
    dynamicParams,
    jsonataExpression,
  } = options;

  const {
    paramKeyLocation,
    paramValueLocation,
    jsonataLocation,
    pathLocation,
  } = dynamicParams;
  const { formData } = props.formContext;

  useEffect(() => {
    if (paramKeyLocation && paramValueLocation) {
      const previousField = get(formData, paramValueLocation);
      if (previousField) {
        setParamValue(previousField);
      } else {
        setParamValue(undefined);
      }
    }
  }, [formData, paramKeyLocation, paramValueLocation]);

  useEffect(() => {
    if (paramKeyLocation && paramValueLocation) {
      const key = get(formData, paramKeyLocation);
      if (key) {
        setParamKey(key);
      } else {
        setParamKey(undefined);
      }
    }
  }, [formData, paramKeyLocation, paramValueLocation]);

  useEffect(() => {
    if (jsonataLocation) {
      const jsonataString = get(formData, jsonataLocation);
      if (jsonataString) {
        setJsonataLookupExpression(jsonataString);
      } else {
        setJsonataLookupExpression(undefined);
      }
    }
    if (jsonataExpression && !jsonataLocation) {
      setJsonataLookupExpression(jsonataExpression);
    }
  }, [formData, jsonataExpression, jsonataLocation]);

  useEffect(() => {
    if (pathLocation) {
      const pathString = get(formData, pathLocation);
      if (pathString) {
        setPathExtension(pathString);
      } else {
        setPathExtension(undefined);
      }
    }
    if (path && !pathLocation) {
      setPathExtension(path);
    }
  }, [formData, pathExtension, pathLocation, path]);

  const parseWithJsonata = async (body: any) => {
    try {
      const expression = jsonata(jsonataLookupExpression!);
      const result = await expression.evaluate(body);
      return result;
    } catch (e: any) {
      const message = e.hasOwnProperty('message')
        ? e.message
        : 'unknown JSONata evaluation error';
      throw new Error(`JSONata failed to evaluate the expression: ${message}`);
    }
  };

  const constructDropdownValues = (body: any) => {
    const array = arraySelector ? get(body, arraySelector) : body;
    return array.map((item: unknown) => {
      let value: string | undefined;
      let label: string | undefined;

      if (valueSelector) {
        value = get(item, valueSelector);
        label = labelSelector ? get(item, labelSelector) : value;
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
  };

  const { value, error, loading } = useAsync(async () => {
    if (
      (paramValueLocation && !paramValue) ||
      (paramKeyLocation && !paramKey) ||
      (pathLocation && !pathExtension)
    ) {
      return [];
    }
    const baseUrl = await discoveryApi.getBaseUrl('');
    const requestParams = new URLSearchParams(params);
    if (paramKey && paramValue) {
      requestParams.append(paramKey, paramValue);
    }
    const response = await fetchApi.fetch(
      `${baseUrl}${pathExtension}?${requestParams}`,
    );
    const body = await response.json();
    if (body) {
      if (jsonataLookupExpression) {
        const parsedItems = await parseWithJsonata(body);
        if (!Array.isArray(parsedItems)) {
          setDropDownData([]);
          throw new Error(
            `Jsonata expression did not produce an array of values: ${parsedItems}. Please change it so that it does.`,
          );
        }
        if (Array.isArray(parsedItems)) {
          setDropDownData(parsedItems.map(i => ({ label: i, value: i })));
        }
        return parsedItems;
      }
      if (!jsonataLookupExpression && arraySelector) {
        const values = constructDropdownValues(body);
        if (values) {
          setDropDownData(values);
          return values;
        }
        if (!values) {
          if (arraySelector) {
            const lookupKey = arraySelector;
            throw new Error(
              `Failed to parse response using array selector: ${lookupKey}`,
            );
          }
        }
      }
      setDropDownData([]);
    }
    return body;
  }, [
    paramValue,
    jsonataExpression,
    jsonataLookupExpression,
    paramKey,
    paramValue,
    pathExtension,
  ]);

  if (error && !loading) {
    return <ErrorPanel error={error} />;
  }

  if (paramKeyLocation && paramValueLocation && !paramValue) {
    return <></>;
  }

  if (!dropDownData || (loading && !value)) {
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
