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

import { ResponsiveBar } from '@nivo/bar';
import { WizIssue } from '../Issues/types';
import { useTheme } from '@material-ui/core';

export const BarChart = ({ issues }: { issues: WizIssue[] }) => {
  const theme = useTheme();

  const severityMap: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  } = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  const transformIssuesBySeverityForChart = () => {
    const monthMap: Record<
      string,
      { CRITICAL: number; HIGH: number; MEDIUM: number; LOW: number }
    > = {};

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    issues.forEach(issue => {
      const createdAtDate = new Date(issue.createdAt);

      if (createdAtDate >= sixMonthsAgo) {
        const createdAtMonth = createdAtDate.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        });

        if (!monthMap[createdAtMonth]) {
          monthMap[createdAtMonth] = { ...severityMap };
        }

        if (issue.severity) {
          monthMap[createdAtMonth][
            issue.severity as keyof typeof severityMap
          ] += 1;
        }
      }
    });

    const sortedMonths = Object.keys(monthMap).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.map(month => ({
      date: month,
      CRITICAL: monthMap[month].CRITICAL,
      HIGH: monthMap[month].HIGH,
      MEDIUM: monthMap[month].MEDIUM,
      LOW: monthMap[month].LOW,
    }));
  };

  const severityChartData = transformIssuesBySeverityForChart();

  return (
    <div style={{ height: 400 }}>
      <ResponsiveBar
        data={severityChartData}
        keys={['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']}
        indexBy="date"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
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
            dataFrom: 'keys',
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
  );
};
