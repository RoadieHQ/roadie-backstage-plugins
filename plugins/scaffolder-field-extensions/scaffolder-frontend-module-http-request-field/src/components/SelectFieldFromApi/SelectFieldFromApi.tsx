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
import { FieldProps, FieldValidation } from '@rjsf/core';
import FormControl from '@material-ui/core/FormControl';
import { KubernetesValidatorFunctions } from '@backstage/catalog-model';
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

const getLabel = (
  item: unknown,
  labelSelector: string | string[] | undefined,
): string | undefined => {
  if (!labelSelector) {
    return undefined;
  }
  const label = get(item, labelSelector);
  if (typeof label === 'string') {
    return label;
  }
  throw new Error('Label type must be a string');
};

const getLabelFromValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }
  throw new Error(
    'Value must be a string, when not providing labelSelector, please provide a labelSelector referring to a string',
  );
};

export const SelectFieldFromApi = (props: FieldProps<unknown>) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [dropDownData, setDropDownData] = useState<SelectItem[] | undefined>();
  const options = selectFieldFromApiConfigSchema.parse(
    props.uiSchema['ui:options'],
  );
  const { title = 'Select', description = '' } = options;

  const { error } = useAsync(async () => {
    const baseUrl = await discoveryApi.getBaseUrl('');
    const params = new URLSearchParams(options.params);
    const response = await fetchApi.fetch(
      `${baseUrl}${options.path}?${params}`,
    );
    const body = await response.json();
    const array = options.arraySelector
      ? get(body, options.arraySelector)
      : body;
    const constructedData = array.map((item: unknown) => {
      let value: unknown | undefined;
      let label: string | undefined;

      if (options.valueSelector) {
        value = get(item, options.valueSelector);
        label = getLabel(item, options.valueSelector);
        label = label ? label : getLabelFromValue(value);
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

export const selectFieldFromApiValidation = (
  value: unknown,
  validation: FieldValidation,
) => {
  if (typeof value === 'string') {
    if (!KubernetesValidatorFunctions.isValidObjectName(value)) {
      validation.addError(
        'must start and end with an alphanumeric character, and contain only alphanumeric characters, hyphens, underscores, and periods. Maximum length is 63 characters.',
      );
    }
  }
};
