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

import { useMetrics, useAlerts } from './usePrometheus';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';

jest.mock('@backstage/core-plugin-api');
jest.mock('react-use');

describe('usePrometheus', () => {
  (useApi as any).mockReturnValue({
    getApiUrl: () => 'dontcare',
    query: () => ['this', 'is', 'mocked', 'via', 'other', 'hook'],
    getAlerts: () => ['alert'],
  });

  describe('useMetrics', () => {
    it('should use first property of response as dimension when not defined', () => {
      const firstProperty = 'memUsage';

      (useAsync as any).mockReturnValue({
        value: require('../mocks/mockQueryResponse.json'),
        loading: false,
      });

      const { metrics, keys, data } = useMetrics({
        query: 'something something',
      });

      expect(metrics).toHaveProperty(firstProperty);
      expect(keys).toStrictEqual([firstProperty]);
      expect(data).toHaveLength(2);
    });

    it("should handle cases where dimension doesn't exist", () => {
      const firstProperty = 'memUsage';

      (useAsync as any).mockReturnValue({
        value: require('../mocks/mockQueryResponse.json'),
        loading: false,
      });

      const { metrics, keys, data } = useMetrics({
        query: 'something something',
        dimension: 'notexisting',
      });
      expect(metrics).toHaveProperty(firstProperty);
      expect(keys).toStrictEqual([firstProperty]);
      expect(data).toHaveLength(2);
    });
  });

  describe('useAlerts', () => {
    it('should return alerts defined in hook call', () => {
      (useAsync as any).mockReturnValue({
        value: require('../mocks/mockAlertResponse.json'),
        loading: false,
      });

      const { displayableAlerts } = useAlerts(['test alert name']);
      expect(displayableAlerts).toHaveLength(1);
      const alert = displayableAlerts[0];
      expect(alert.state).toBe('firing');
    });

    it('should filter out alerts not requested', () => {
      (useAsync as any).mockReturnValue({
        value: require('../mocks/mockAlertResponse.json'),
        loading: false,
      });

      const { displayableAlerts } = useAlerts(['not existing alert']);
      expect(displayableAlerts).toHaveLength(0);
    });
  });
});
