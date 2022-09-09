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
import { get } from 'lodash';

export const SelectFieldFromApi = (props: FieldProps<string>) => {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const [dropDownData, setDropDownData] = useState<SelectItem[] | undefined>();

  const { error } = useAsync(async () => {
    const baseUrl = await discoveryApi.getBaseUrl('');
    const params = new URLSearchParams(props.uiSchema['ui:params']);
    const response = await fetchApi.fetch(
      `${baseUrl}${props.uiSchema['ui:path']}?${params}`,
    );
    const body = await response.json();
    const array = get(body, props.uiSchema['ui:arraySelector']);
    setDropDownData(
      array.map((item: unknown) => {
        let value: string | undefined;
        let label: string | undefined;

        if (props.uiSchema['ui:valueSelector']) {
          value = get(item, props.uiSchema['ui:valueSelector']);
          label = get(item, props.uiSchema['ui:labelSelector']) || value;
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
      }),
    );
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
      <Select items={dropDownData} label="Select" onChange={props.onChange} />
    </FormControl>
  );
};

export const selectFieldFromApiValidation = (
  value: string,
  validation: FieldValidation,
) => {
  if (!KubernetesValidatorFunctions.isValidObjectName(value)) {
    validation.addError(
      'must start and end with an alphanumeric character, and contain only alphanumeric characters, hyphens, underscores, and periods. Maximum length is 63 characters.',
    );
  }
};
