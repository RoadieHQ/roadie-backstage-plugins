/*
 * Copyright 2021 Larder Software Limited
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

export type PrometheusMatrixVectorResult = {
  metric: {
    [key: string]: string;
  };
  values: [number, string][];
};

export type PrometheusScalarStringResult = [number, string][];

export type ResultType = 'matrix' | 'vector' | 'scalar' | 'string';
export type PrometheusResponse = {
  status: 'success' | 'error';

  // Only set if status is "error". The data field may still hold
  // additional data.
  errorType?: string;
  error?: string;

  // Only if there were warnings while executing the request.
  // There will still be data in the data field.
  warnings?: string[];

  data: {
    resultType: ResultType;
    result: PrometheusMatrixVectorResult[] | PrometheusScalarStringResult[];
  };
};

export type PrometheusDisplayableAlert = PrometheusRule & PrometheusAlert;

type PrometheusRule = {
  name: string;
  state: 'firing' | 'pending' | 'inactive';
  query: string;
  duration: number;
  health: string;
  evaluationTime: string;
  lastEvaluation: string;
  type: string;
  alerts: PrometheusAlert[];
  labels?: {
    [key: string]: string;
  };
  annotations?: PrometheusAnnotations;
};

interface PrometheusAnnotations {
  [key: string]: string;
}

type PrometheusAlert = {
  activeAt: string;
  annotations: PrometheusAnnotations;
  labels: {
    alertname: string;
  };
  state: 'firing' | 'pending' | 'inactive';
  value: string;
};

export type PrometheusRuleResponse = {
  data: {
    groups: {
      name: string;
      file: string;
      rules: PrometheusRule[];
      interval: number;
      evaluationTime: number;
      lastEvaluation: string;
    }[];
  };
  status: 'success' | 'error';
};

export type OnRowClick = (arg: PrometheusDisplayableAlert) => void;
