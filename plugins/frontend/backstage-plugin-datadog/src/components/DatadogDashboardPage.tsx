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


import React from 'react';
import { Entity } from '@backstage/catalog-model';
import { InfoCard } from '@backstage/core-components';
import { useDatadogAppData } from './useDatadogAppData';
import { Resizable } from 're-resizable';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';

export const DatadogDashboardPage = ({ entity }: { entity: Entity }) => {
  const { dashboardUrl } = useDatadogAppData({ entity });
  return (
    <InfoCard title="Datadog dashboard">
      <Resizable
        defaultSize={{
          width: '100%',
          height: 500,
        }}
        handleComponent={{ bottomRight: <ZoomOutMapIcon /> }}
      >
        <iframe
          title="dashboard"
          src={`${dashboardUrl}`}
          style={{
            border: 'none',
            height: '100%',
            width: '100%',
            resize: 'both',
            overflow: 'auto',
          }}
        />
      </Resizable>
    </InfoCard>
  );
};
