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
import { selectFieldFromApiConfigSchema } from '../../types';
import { FormHelperText } from '@material-ui/core';

export const SelectFieldFromApi = (props: FieldProps<string>) => {
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
