/*
 * Copyright 2020 RoadieHQ
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
import { Link, LinearProgress, Typography, Grid } from '@material-ui/core';
import { InfoCard, StructuredMetadataTable } from '@backstage/core-components';
import moment from 'moment';
import { useFunctionIds } from '../hooks/useFunctionIds';
import { useSingleFirebaseFunction } from '../hooks/useSingleFirebaseFunction';

export const FirebaseFunctionDetailsPage: React.FC = () => {
  const { functions: whitelistedFunctions } = useFunctionIds();
  const { loading, functionData, error } = useSingleFirebaseFunction(
    whitelistedFunctions[0],
  );

  if (error) {
    return <Typography>{error.message}</Typography>;
  }

  return (
    <>
      {loading || !functionData ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={1}>
          <Grid item md={6}>
            <InfoCard
              title={
                <Link
                  href={`https://console.cloud.google.com/functions/details/${functionData.region}/${functionData.name}?project=${functionData.project}`}
                  target="_blank"
                >
                  {functionData.name}
                </Link>
              }
            >
              <StructuredMetadataTable
                metadata={{
                  status: functionData.status,
                  'last modified': moment(functionData.updateTime).fromNow(),
                  project: functionData.project,
                  region: functionData.region,
                  runtime: functionData.runtime,
                  memory: `${functionData.availableMemoryMb} MB`,
                  logs: (
                    <Link
                      href={`https://console.cloud.google.com/logs/viewer?project=${functionData.project}&resource=cloud_function%2Ffunction_name%2F${functionData.name}%2Fregion%2F${functionData.region}`}
                      target="_blank"
                    >
                      view logs
                    </Link>
                  ),
                }}
              />
            </InfoCard>
          </Grid>
          <Grid item md={6}>
            <InfoCard title="Labels">
              <StructuredMetadataTable metadata={functionData.labels} />
            </InfoCard>
          </Grid>
        </Grid>
      )}
    </>
  );
};
