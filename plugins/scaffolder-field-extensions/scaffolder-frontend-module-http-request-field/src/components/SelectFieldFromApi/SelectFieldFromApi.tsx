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
  const [previousFieldValue, setPreviousFieldValue] = useState<
    string | undefined
  >(undefined);
  const [jsonataLookupExpression, setJsonataLookupExpression] = useState<
    string | undefined
  >(undefined);

  const options = selectFieldFromApiConfigSchema.parse(
    props.uiSchema['ui:options'],
  );
  const {
    title = 'Select',
    description = '',
    previousFieldParamRequestKey,
    previousFieldParamValueLookupKey,
    previousFieldJsonataLookupKey,
    jsonataExpression,
  } = options;
  const { formData } = props.formContext;

  useEffect(() => {
    if (previousFieldParamRequestKey && previousFieldParamValueLookupKey) {
      const previousField = get(formData, previousFieldParamValueLookupKey);
      if (previousField) {
        setPreviousFieldValue(previousField);
      } else {
        setPreviousFieldValue(undefined);
      }
    }
  }, [
    formData,
    previousFieldParamRequestKey,
    previousFieldParamValueLookupKey,
  ]);

  useEffect(() => {
    if (previousFieldJsonataLookupKey) {
      const jsonataString = get(formData, previousFieldJsonataLookupKey);
      if (jsonataString) {
        setJsonataLookupExpression(jsonataString);
      } else {
        setJsonataLookupExpression(undefined);
      }
    }
    if (jsonataExpression && !previousFieldJsonataLookupKey) {
      setJsonataLookupExpression(jsonataExpression);
    }
  }, [formData, jsonataExpression, previousFieldJsonataLookupKey]);

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
    const array = options.arraySelector
      ? get(body, options.arraySelector)
      : body;
    return array.map((item: unknown) => {
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
  };

  const { value, error, loading } = useAsync(async () => {
    if (
      previousFieldParamValueLookupKey &&
      previousFieldParamRequestKey &&
      !previousFieldValue
    ) {
      return [];
    }
    const baseUrl = await discoveryApi.getBaseUrl('');
    const params = new URLSearchParams(options.params);
    if (previousFieldParamRequestKey && previousFieldValue) {
      params.append(previousFieldParamRequestKey, previousFieldValue);
    }
    const response = await fetchApi.fetch(
      `${baseUrl}${options.path}?${params}`,
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
      if (!jsonataLookupExpression && options.arraySelector) {
        const values = constructDropdownValues(body);
        if (values) {
          setDropDownData(values);
          return values;
        }
        if (!values) {
          if (options.arraySelector) {
            const lookupKey = options.arraySelector;
            throw new Error(
              `Failed to parse response using array selector: ${lookupKey}`,
            );
          }
        }
      }
      setDropDownData([]);
    }
    return body;
  }, [previousFieldValue, jsonataExpression]);

  if (error && !loading) {
    return <ErrorPanel error={error} />;
  }

  if (
    previousFieldParamRequestKey &&
    previousFieldParamValueLookupKey &&
    !previousFieldValue
  ) {
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
