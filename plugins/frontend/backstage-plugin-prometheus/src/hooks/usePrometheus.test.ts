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

import { resultToGraphData, useAlerts } from './usePrometheus';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { useEntity } from '@backstage/plugin-catalog-react';
import { getLabels } from '../components/util';

jest.mock('@backstage/core-plugin-api');
jest.mock('react-use');
jest.mock('@backstage/plugin-catalog-react');
jest.mock('../components/util');

describe('usePrometheus', () => {
  (useApi as any).mockReturnValue({
    getApiUrl: () => 'dontcare',
    query: () => ['this', 'is', 'mocked', 'via', 'other', 'hook'],
    getAlerts: () => ['alert'],
    getUiUrl: () => undefined,
  });

  (useEntity as any).mockReturnValue({
    entity: undefined,
  });

  describe('resultToGraphData', () => {
    it('should use first property of response as dimension when not defined', async () => {
      const firstProperty = 'memUsage';

      const response = require('../mocks/mockQueryResponse.json');
      const { metrics, keys, data } = resultToGraphData(response.data.result);
      expect(metrics).toHaveProperty(firstProperty);
      expect(keys).toStrictEqual([firstProperty]);
      expect(data).toHaveLength(2);
    });

    it("should handle cases where dimension doesn't exist", async () => {
      const firstProperty = 'memUsage';

      const response = require('../mocks/mockQueryResponse.json');
      const { metrics, keys, data } = resultToGraphData(
        response.data.result,
        'something non existing',
      );
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

    it('should filter alerts with label severity=page', () => {
      (useAsync as any).mockReturnValue({
        value: require('../mocks/mockAlertResponse.json'),
        loading: false,
      });

      (getLabels as any).mockReturnValue('severity=page');

      const { displayableAlerts } = useAlerts('all');
      expect(displayableAlerts).toHaveLength(1);
    });

    it('should filter alerts with label severity=noalerts', () => {
      (useAsync as any).mockReturnValue({
        value: require('../mocks/mockAlertResponse.json'),
        loading: false,
      });

      (getLabels as any).mockReturnValue('severity=noalerts');

      const { displayableAlerts } = useAlerts('all');
      expect(displayableAlerts).toHaveLength(0);
    });

    it('No label selector is defined', () => {
      (useAsync as any).mockReturnValue({
        value: require('../mocks/mockAlertResponse.json'),
        loading: false,
      });

      (getLabels as any).mockReturnValue(undefined);

      const { displayableAlerts } = useAlerts('all');
      expect(displayableAlerts).toHaveLength(1);
    });

    describe('inactive alerts', () => {
      it('should not show inactive alerts by default', () => {
        (useAsync as any).mockReturnValue({
          value: require('../mocks/mockAlertResponse.json'),
          loading: false,
        });
        (getLabels as any).mockReturnValue(undefined);

        const { displayableAlerts } = useAlerts('all');
        expect(displayableAlerts).toHaveLength(1);
        expect(displayableAlerts[0].name).toBe('test alert name');
        expect(displayableAlerts[0].state).toBe('firing');
      });

      it('should show inactive alerts when showInactiveAlerts is true', () => {
        (useAsync as any).mockReturnValue({
          value: require('../mocks/mockAlertResponse.json'),
          loading: false,
        });
        (getLabels as any).mockReturnValue(undefined);

        const { displayableAlerts } = useAlerts('all', true);
        expect(displayableAlerts).toHaveLength(2);
        expect(displayableAlerts.map(a => a.name)).toContain('inactive alert');
      });
    });
  });
});
