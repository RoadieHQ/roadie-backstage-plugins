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
import { FC } from 'react';
import { Progress } from '@backstage/core-components';
import { LAUNCHDARKLY_PROJECT_KEY_ANNOTATION } from '../../constants';
import { ContextFlag } from '../../hooks/useLaunchdarklyContextFlags';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from '@material-ui/core';
import { useEntity } from '@backstage/plugin-catalog-react';

interface FlagDetailsPanelProps {
  flag: ContextFlag;
}

const StatusChip = ({
  isOn,
  archived,
}: {
  isOn: boolean;
  archived: boolean;
}) => {
  if (archived) {
    return (
      <Chip
        label="Archived"
        size="small"
        style={{ backgroundColor: '#666', color: 'white' }}
      />
    );
  }
  return (
    <Chip
      label={isOn ? 'On' : 'Off'}
      size="small"
      style={{
        backgroundColor: isOn ? '#4caf50' : '#f44336',
        color: 'white',
      }}
    />
  );
};

const ContextTargetsDisplay = ({
  contextTargets,
}: {
  contextTargets: any[];
}) => {
  if (!contextTargets || contextTargets.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        None
      </Typography>
    );
  }

  return (
    <Box>
      {contextTargets.map((target, index) => (
        <Box key={index} style={{ marginBottom: '8px' }}>
          <Typography variant="body2" style={{ fontWeight: 'bold' }}>
            {target.contextKind} (variation {target.variation}):
          </Typography>
          <Box style={{ marginLeft: '16px' }}>
            {target.values && target.values.length > 0 ? (
              <Box
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                {target.values.map((value: string, valueIndex: number) => (
                  <Chip
                    key={valueIndex}
                    label={value}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No values
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const FallthroughDisplay = ({ fallthrough }: { fallthrough: any }) => {
  if (!fallthrough) {
    return (
      <Typography variant="body2" color="textSecondary">
        None
      </Typography>
    );
  }

  return (
    <Typography variant="body2">
      Variation: {fallthrough.variation}
      {fallthrough.rollout && <span> (with rollout)</span>}
    </Typography>
  );
};

const formatLastModified = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

export const FlagDetailsPanel: FC<FlagDetailsPanelProps> = ({ flag }) => {
  const { entity } = useEntity();
  const discoveryApi = useApi(discoveryApiRef);
  const { value: flagDetails, loading } = useAsync(async () => {
    try {
      const projectKey =
        entity.metadata.annotations?.[LAUNCHDARKLY_PROJECT_KEY_ANNOTATION] ||
        'default';

      const url = `${await discoveryApi.getBaseUrl('proxy')}/launchdarkly/api`;

      const flagDetailsResponse = await fetch(
        `${url}/v2/flags/${projectKey}/${flag.key}`,
      );

      if (flagDetailsResponse.ok) {
        const details = await flagDetailsResponse.json();
        return details;
      }
      return undefined;
    } catch (err) {
      // Silently continue if we can't fetch details for a flag
      return undefined;
    }
  });

  if (loading) {
    return <Progress />;
  }

  if (!flagDetails?.environments) {
    return <p>No targeting information available</p>;
  }

  const environments = flagDetails.environments;

  return (
    <Box style={{ margin: '16px' }}>
      <Typography variant="h6" style={{ marginBottom: '16px' }}>
        Environment Targeting
      </Typography>

      <Grid container spacing={2}>
        {Object.entries(environments).map(
          ([envKey, envData]: [string, any]) => (
            <Grid item xs={12} md={6} key={envKey}>
              <Card variant="outlined">
                <CardContent>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <Typography variant="h6">
                      {envData._environmentName || envKey}
                    </Typography>
                    <StatusChip isOn={envData.on} archived={envData.archived} />
                  </Box>

                  <Box style={{ marginBottom: '12px' }}>
                    <Typography
                      variant="body2"
                      style={{ fontWeight: 'bold', marginBottom: '4px' }}
                    >
                      Context Targets:
                    </Typography>
                    <ContextTargetsDisplay
                      contextTargets={envData.contextTargets}
                    />
                  </Box>

                  <Box style={{ marginBottom: '12px' }}>
                    <Typography
                      variant="body2"
                      style={{ fontWeight: 'bold', marginBottom: '4px' }}
                    >
                      Fallthrough:
                    </Typography>
                    <FallthroughDisplay fallthrough={envData.fallthrough} />
                  </Box>

                  <Box style={{ marginBottom: '12px' }}>
                    <Typography
                      variant="body2"
                      style={{ fontWeight: 'bold', marginBottom: '4px' }}
                    >
                      Off Variation:
                    </Typography>
                    <Typography variant="body2">
                      {envData.offVariation}
                    </Typography>
                  </Box>

                  {envData.rules && envData.rules.length > 0 && (
                    <Box style={{ marginBottom: '12px' }}>
                      <Typography
                        variant="body2"
                        style={{ fontWeight: 'bold', marginBottom: '4px' }}
                      >
                        Rules:
                      </Typography>
                      <Typography variant="body2">
                        {envData.rules.length} rule(s)
                      </Typography>
                    </Box>
                  )}

                  <Box
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      fontSize: '0.75rem',
                      color: '#666',
                    }}
                  >
                    <Typography variant="caption">
                      Version: {envData.version}
                    </Typography>
                    <Typography variant="caption">
                      Last Modified: {formatLastModified(envData.lastModified)}
                    </Typography>
                    <Typography variant="caption">
                      Track Events: {envData.trackEvents ? 'Yes' : 'No'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ),
        )}
      </Grid>
    </Box>
  );
};
