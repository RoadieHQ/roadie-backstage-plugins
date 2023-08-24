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
import sortBy from 'lodash/sortBy';
import { selectFieldFromApiConfigSchema } from '../../types';
import { FormHelperText } from '@material-ui/core';

export const SelectFieldFromApi = (props: FieldProps<string>) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [dropDownData, setDropDownData] = useState<SelectItem[] | undefined>();
  const [previousFieldValue, setPreviousFieldValue] = useState<
    string | undefined
  >(undefined);
  const [previousFieldArraySelector, setPreviousFieldArraySelector] = useState<
    string | undefined
  >(undefined);
  const [previousFieldValueSelector, setPreviousFieldValueSelector] = useState<
    string | undefined
  >(undefined);
  const [previousFieldLabelSelector, setPreviousFieldLabelSelector] = useState<
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
    previousFieldArraySelectorLookupKey,
    previousFieldValueSelectorLookupKey,
    previousFieldLabelSelectorLookupKey,
  } = options;
  const { formData } = props.formContext;

  useEffect(() => {
    if (previousFieldParamRequestKey && previousFieldParamValueLookupKey) {
      const previousField = get(
        formData?.[0],
        previousFieldParamValueLookupKey,
      );
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
    if (previousFieldValueSelectorLookupKey) {
      const previousField = get(
        formData?.[0],
        previousFieldValueSelectorLookupKey,
      );
      if (previousField) {
        setPreviousFieldValueSelector(previousField);
      } else {
        setPreviousFieldValueSelector(undefined);
      }
    }
  }, [formData, previousFieldValueSelectorLookupKey]);

  useEffect(() => {
    if (previousFieldLabelSelectorLookupKey) {
      const previousField = get(
        formData?.[0],
        previousFieldLabelSelectorLookupKey,
      );
      if (previousField) {
        setPreviousFieldLabelSelector(previousField);
      } else {
        setPreviousFieldLabelSelector(undefined);
      }
    }
  }, [formData, previousFieldLabelSelectorLookupKey]);

  useEffect(() => {
    if (previousFieldArraySelectorLookupKey) {
      const previousField = get(
        formData?.[0],
        previousFieldArraySelectorLookupKey,
      );
      if (previousField) {
        setPreviousFieldArraySelector(previousField);
      } else {
        setPreviousFieldArraySelector(undefined);
      }
    }
  }, [formData, previousFieldArraySelectorLookupKey]);

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
      const getViaDependant = previousFieldArraySelector
        ? get(body, previousFieldArraySelector)
        : body;
      const array = options.arraySelector
        ? get(body, options.arraySelector)
        : getViaDependant;
      if (array && Array.isArray(array)) {
        const constructedData = array.map((item: unknown) => {
          let itemValue: string | undefined;
          let label: string | undefined;
          const valueSelector =
            options.valueSelector || previousFieldValueSelector;
          const labelSelector =
            options.labelSelector || previousFieldLabelSelector;

          if (valueSelector) {
            itemValue = get(item, valueSelector);
            label = labelSelector ? get(item, labelSelector) : itemValue;
          }

          if (!valueSelector) {
            throw new Error(
              `No value selector specified. Cannot parse response.`,
            );
          }

          if (!itemValue) {
            throw new Error(
              `No value could be extracted from response. Please check your value selector fits the response data.`,
            );
          }

          return {
            value: itemValue,
            label: label || itemValue,
          };
        });
        setDropDownData(sortBy(constructedData, 'label'));
      }
      if (!array) {
        if (options.arraySelector || previousFieldArraySelector) {
          const lookupKey = options.arraySelector || previousFieldArraySelector;
          throw new Error(
            `Failed to parse response using array selector: ${lookupKey}`,
          );
        }
      }
      return array;
    }
    return body;
  }, [
    previousFieldValue,
    previousFieldArraySelector,
    previousFieldLabelSelector,
  ]);

  if (error && !loading && !value && !dropDownData) {
    return <ErrorPanel error={error} />;
  }

  if (
    previousFieldParamRequestKey &&
    previousFieldParamValueLookupKey &&
    !previousFieldValue
  ) {
    return <></>;
  }

  if (!dropDownData || loading) {
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
