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

import { Typography, Paper, Box } from '@material-ui/core';
import { TooltipProps } from 'recharts';

type ExtraTooltipProps = {
  collector: {
    collect: Function;
    maxAndMin: Function;
  };
  metrics: { [k: string]: any };
};

export const CustomTooltip = ({
  active,
  payload,
  label,
  coordinate,
  collector,
  metrics,
}: TooltipProps & ExtraTooltipProps) => {
  if (payload === null) return null;

  if (active) {
    const { min, max } = collector.maxAndMin();
    const threshold = min.value / 30;
    const deltaY = max.y - min.y;
    const deltaValue = max.value - min.value;
    const cursorValue =
      min.value - deltaValue * ((min.y - coordinate!!.y) / deltaY);
    const points = payload!!.map(p => {
      const { color, dataKey, fill, name, payload: vals } = p;
      return {
        color,
        dataKey,
        fill,
        name,
        value: vals[dataKey as string],
      };
    });
    const nearestPointIndexes = points.reduce(
      (
        acc: { index: number; delta: number }[],
        curr: { value: number },
        index: number,
      ) => {
        const delta = Math.abs(curr.value - cursorValue);
        if (acc.length === 0)
          return delta < threshold ? [{ index, delta }] : [];
        if (Math.abs(delta - acc[0].delta) < threshold)
          return acc.concat([{ index, delta }]);
        return acc;
      },
      [],
    );

    if (nearestPointIndexes.length === 0) return null;
    const nearestPoints = nearestPointIndexes.map(({ index }) => points[index]);
    return (
      <Box margin={3}>
        <Paper>
          <Box padding={2} display="flex" flexDirection="row">
            {nearestPoints.map((nearestPoint, index) => {
              const metricForItem = metrics[nearestPoint.name];
              return (
                <Box key={`nearestPoint_${index}`}>
                  <Box>
                    <Typography variant="h6">{nearestPoint.name}</Typography>
                    <Typography variant="subtitle1">{label}</Typography>
                  </Box>
                  {Object.entries(metricForItem).map(([key, val]) => (
                    <Typography
                      key={key}
                      variant="caption"
                      display="block"
                      gutterBottom
                    >
                      {`${key}: ${val}`}
                    </Typography>
                  ))}
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Box>
    );
  }
  return null;
};

export function tooltipCollector() {
  const collection: { value: number; y: number }[] = [];
  let _min = { y: 0, value: 0 };
  let _max = { y: 1, value: 1 };
  function _setMaxAndMin(coll: { value: number; y: number }[]) {
    const ys = coll.map(obj => obj.y);
    const maxY = Math.max(...ys);
    const maxYIndex = ys.indexOf(maxY);
    _max = coll[maxYIndex];
    const minY = Math.min(...ys);
    const minYIndex = ys.indexOf(minY);
    _min = coll[minYIndex];
  }
  return {
    collect: (value: number, y: number) => {
      collection.push({ value, y });
      _setMaxAndMin(collection);
    },
    maxAndMin: () => {
      return {
        max: { ..._max },
        min: { ..._min },
      };
    },
  };
}
