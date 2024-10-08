/*
 * Copyright 2024 Larder Software Limited
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
import { ResponsiveLine } from '@nivo/line';
import { WizIssue } from '../Issues/types';
import { useTheme } from '@material-ui/core';

export const LineChart = ({ issues }: { issues: WizIssue[] }) => {
  const theme = useTheme();
  const transformIssuesForChart = () => {
    const monthMap: Record<string, { open: number; resolved: number }> = {};

    issues.forEach(
      (issue: {
        createdAt: string | number | Date;
        resolvedAt: string | number | Date;
      }) => {
        const createdAtMonth = new Date(issue.createdAt).toLocaleString(
          'default',
          { month: 'short', year: 'numeric' },
        );
        const resolvedAtMonth = issue.resolvedAt
          ? new Date(issue.resolvedAt).toLocaleString('default', {
              month: 'short',
              year: 'numeric',
            })
          : null;

        if (!monthMap[createdAtMonth]) {
          monthMap[createdAtMonth] = { open: 0, resolved: 0 };
        }
        monthMap[createdAtMonth].open += 1;

        if (resolvedAtMonth) {
          if (!monthMap[resolvedAtMonth]) {
            monthMap[resolvedAtMonth] = { open: 0, resolved: 0 };
          }
          monthMap[resolvedAtMonth].resolved += 1;
        }
      },
    );

    return Object.keys(monthMap)
      .sort()
      .map(month => ({
        date: month,
        open: monthMap[month].open,
        resolved: monthMap[month].resolved,
      }));
  };

  const chartData = transformIssuesForChart();

  const sortDataByDate = (data: any[]) => {
    return data.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0;
      }
      return dateA.getTime() - dateB.getTime();
    });
  };

  const data = [
    {
      id: 'Open',
      data: sortDataByDate(chartData).map(d => ({ x: d.date, y: d.open })),
    },
    {
      id: 'Resolved',
      data: sortDataByDate(chartData).map(d => ({ x: d.date, y: d.resolved })),
    },
  ];

  const sortedData = sortDataByDate(data);

  return (
    <>
      <div style={{ height: 400, width: '40vw' }}>
        <ResponsiveLine
          data={sortedData}
          useMesh
          axisTop={null}
          axisRight={null}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
          theme={{
            axis: {
              ticks: {
                text: {
                  fill: theme.palette.text.primary,
                },
              },
            },
            tooltip: {
              container: {
                color: theme.palette.text.primary,
                background: theme.palette.background.default,
                borderRadius: '5px',
                padding: '5px',
              },
            },
          }}
          legends={[
            {
              anchor: 'bottom-right',
              itemTextColor: theme.palette.text.primary,
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      </div>
    </>
  );
};
