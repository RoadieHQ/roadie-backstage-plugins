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
import { DateTime, Duration } from 'luxon';
import { Box, Typography, useTheme } from '@material-ui/core';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  ContentRenderer,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import useDimensions from 'react-use-dimensions';
import { Progress } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';
import { BackstagePalette } from '@backstage/theme';
import _ from 'lodash';
import { tooltipCollector, CustomTooltip } from '../CustomTooltip';

const strokeColors = ['#8884d8', '#82ca9d', '#e74a3b', '#d873ea'];

type PrometheusTheme = {
  palette: BackstagePalette;
};

type PrometheusMatrixVectorResult = {
  metric: {
    [key: string]: string;
  };
  values: [number, string][];
};

type PrometheusScalarStringResult = [number, string][];

type ResultType = 'matrix' | 'vector' | 'scalar' | 'string';
type PrometheusResponse = {
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

type GraphProps = {
  result: PrometheusMatrixVectorResult[];
};

const useStyles = (theme: PrometheusTheme) => ({
  axis: {
    fill: theme.palette.text.primary,
  },
  container: {
    height: 450,
    width: 1200,
  },
  cartesianGrid: {
    stroke: theme.palette.textVerySubtle,
  },
  chart: {
    margin: {
      right: 30,
      top: 16,
    },
  },
  yAxis: {
    width: 75,
  },
});

function isMetricResult(
  resultType: ResultType,
  _result: PrometheusMatrixVectorResult[] | PrometheusScalarStringResult[],
): _result is PrometheusMatrixVectorResult[] {
  return resultType === 'matrix' || resultType === 'vector';
}

function isScalarResult(
  resultType: ResultType,
  _result: PrometheusMatrixVectorResult[] | PrometheusScalarStringResult[],
): _result is PrometheusScalarStringResult[] {
  return resultType === 'scalar' || resultType === 'string';
}

export const TooltipItem = ({
  item,
}: {
  item: {
    fill: string;
    label: string;
    value: string;
  };
}) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      minHeight={25}
    >
      <Box display="flex" alignContent="center" marginRight=".5em">
        <Typography>{item.label}</Typography>
      </Box>
      <Typography display="block">{item.value}</Typography>
    </Box>
  );
};

/*
const AreaGraph = ({ result }: GraphProps) => {
  const theme = useTheme<PrometheusTheme>();
  const styles = useStyles(theme);

  const { data, keys, metrics } = resultToGraphData(result);
  return (
    <Box display="flex" flexDirection="column">
      <ResponsiveContainer
        width={styles.container.width}
        height={styles.container.height}
        className="cost-overview-chart"
      >
        <AreaChart data={data}>
          <defs>
            {keys.map((key, idx) => (
              <linearGradient
                key={key}
                id={`color${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={strokeColors[idx]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={strokeColors[idx]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            dataKey="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={timeStr =>
              DateTime.fromSeconds(timeStr).toFormat('HH:MM:ss')
            }
            tickCount={6}
            type="number"
            stroke={styles.axis.fill}
          />
          <YAxis />
          <RechartsTooltip
            content={
              <CustomTooltip
                collector={collector}
                unit={chartValuesUnits}
                metrics={metrics}
              />
            }
          />
          {keys.map((key, idx) => (
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey={key}
              stroke={strokeColors[idx]}
              fillOpacity={1}
              fill={`url(#color${key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};
*/

function resultToGraphData(result: PrometheusMatrixVectorResult[]) {
  const keys: string[] = [];
  const metrics: { [k: string]: any } = {};
  const dimension = 'instance';
  const data = _(result)
    .flatMap(it => {
      if (!keys.includes(it.metric[dimension])) {
        keys.push(it.metric[dimension]);
      }
      if (!Object.keys(metrics).includes(it.metric[dimension])) {
        metrics[it.metric[dimension]] = it.metric;
      }
      return it.values.map(val => ({
        time: DateTime.fromSeconds(val[0]).toISOTime(),
        [it.metric[dimension]]: val[1],
      }));
    })
    .groupBy('time')
    .map(_.spread(_.assign))
    .map(it => ({ ...it, time: DateTime.fromISO(it.time).toSeconds() }))
    .value();
  return { data, keys, metrics };
}

function CustomizedTick(props: {
  x: number;
  y: number;
  payload: { value: any };
  collector: {
    collect: Function;
    maxAndMin: Function;
  };
}) {
  const { x, y, payload, collector } = props;
  collector.collect(payload.value, y);
  return (
    <g>
      <text x={x} y={y} fill="#5d6571" textAnchor="end" dy={16}>
        {payload.value}
      </text>
    </g>
  );
}

export const LineGraph = ({ result }: GraphProps) => {
  const collector = tooltipCollector();

  const [chartRef, { width }] = useDimensions(); // [chartRef, { x, y, width, height }]

  const theme = useTheme<PrometheusTheme>();
  const styles = useStyles(theme);

  const { data, keys, metrics } = resultToGraphData(result);

  // ref not part of type definitions on Box, hence hacking it in
  return (
    <Box display="flex" flexDirection="column" {...({ ref: chartRef } as any)}>
      <ResponsiveContainer
        width={width * 0.94}
        height={styles.container.height}
        className="cost-overview-chart"
      >
        <ComposedChart margin={styles.chart.margin} data={data}>
          <CartesianGrid stroke={styles.cartesianGrid.stroke} />
          <XAxis
            dataKey="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={timeStr =>
              DateTime.fromSeconds(timeStr).toFormat('HH:MM:ss')
            }
            tickCount={6}
            type="number"
            stroke={styles.axis.fill}
          />
          <YAxis tick={<CustomizedTick collector={collector} />} />
          <RechartsTooltip
            content={
              <CustomTooltip
                tickCollector={collector}
                unit="integers"
                metrics={metrics}
              />
            }
          />
          <Legend />
          {keys.map((key, idx) => (
            <Line
              dot={false}
              isAnimationActive={false}
              label={false}
              key={key}
              strokeWidth={2}
              dataKey={key}
              stroke={strokeColors[idx]}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export const PrometheusGraph = ({
  query = `node_memory_Active_byte`,
  range = { hours: 1 },
  step = 14,
}: {
  query: string;
  range: {
    hours?: number;
    minutes?: number;
  };
  step?: number;
}) => {
  const { value, loading, error } = useAsync(async (): Promise<
    PrometheusResponse
  > => {
    const end = DateTime.now().toSeconds();
    const start = DateTime.now()
      .minus(Duration.fromObject(range))
      .toSeconds();
    const response = await fetch(
      `http://localhost:9090/api/v1/query_range?query=${query}s&start=${start}&end=${end}&step=${step}`,
    );
    return await response.json();
  }, []);

  if (loading || !value) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const values = value.data.result;
  if (isMetricResult(value.data.resultType, values)) {
    return <LineGraph result={values || []} />;
  }
  isScalarResult(value.data.resultType, values);
  console.log(values);
  return <>hello</>;
};
