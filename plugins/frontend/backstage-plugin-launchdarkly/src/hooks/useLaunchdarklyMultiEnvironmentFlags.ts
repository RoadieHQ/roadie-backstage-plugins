import { Entity } from '@backstage/catalog-model';
import { useAsync } from 'react-use';
import { LAUNCHDARKLY_PROJECT_KEY_ANNOTATION } from '../constants';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';

export type MultiEnvironmentFlag = {
  name: string;
  key: string;
  description?: string;
  tags?: string[];
  maintainer?: string;
  variations?: Array<{
    value: any;
    name?: string;
    description?: string;
  }>;
  environments: Record<
    string,
    {
      name: string;
      status: string;
      link: string;
      on: boolean;
    }
  >;
};

export const useLaunchdarklyMultiEnvironmentFlags = (
  entity: Entity,
  envs?: string[],
) => {
  const discovery = useApi(discoveryApiRef);

  return useAsync(async () => {
    const projectKey =
      entity.metadata.annotations?.[LAUNCHDARKLY_PROJECT_KEY_ANNOTATION] ||
      'default';

    const url = `${await discovery.getBaseUrl('proxy')}/launchdarkly/api`;

    const envQueryParams = (envs ?? []).map(env => `env=${env}`).join('&');

    // Get all flags for the project
    const flagsResponse = await fetch(
      `${url}/v2/flags/${projectKey}?limit=100&offset=0&${envQueryParams}`,
    );

    if (!flagsResponse.ok) {
      throw new Error(
        `Failed to retrieve LaunchDarkly flags for project ${projectKey}: ${flagsResponse.statusText}`,
      );
    }

    const flags = (await flagsResponse.json()).items || [];

    // Get all environments for the project
    const environmentsResponse = await fetch(
      `${url}/v2/projects/${projectKey}`,
    );

    if (!environmentsResponse.ok) {
      throw new Error(
        `Failed to retrieve LaunchDarkly environments for project ${projectKey}: ${environmentsResponse.statusText}`,
      );
    }

    const projectData = await environmentsResponse.json();
    const environments = projectData.environments || {};

    // Create a map of flag keys to flag data
    const flagsMap = new Map();
    flags.forEach((flag: any) => {
      const environmentsData: Record<string, any> = {};

      (envs ?? []).forEach(env => {
        // For each specified environment, create an entry with status and link
        const envData = environments[env];
        const envName = envData?.name || env;
        const link = `https://app.launchdarkly.com/projects/${projectKey}/flags/${flag.key}/targeting?env=${env}&selected-env=${env}`;

        // Get environment-specific flag data from the flag object
        const envFlag = flag.environments?.[env];
        const isOn = envFlag?.on ?? false;

        const flagStatus = envData?.[flag.key];

        // Use status from flag-statuses endpoint if available, otherwise fall back to on/off
        let status = isOn ? 'Enabled' : 'Disabled';
        if (flagStatus && flagStatus.status) {
          status = flagStatus.status;
        }

        environmentsData[env] = {
          name: envName,
          status,
          link,
          on: isOn,
          // Include additional status information if available
          ...(flagStatus && {
            lastRequested: flagStatus.lastRequested,
            lastEvaluated: flagStatus.lastEvaluated,
            evaluationCount: flagStatus.evaluationCount,
          }),
        };
      });

      flagsMap.set(flag.key, {
        name: flag.name,
        key: flag.key,
        description: flag.description,
        tags: flag.tags,
        maintainer: flag._maintainer?.email,
        variations: flag.variations,
        environments: environmentsData,
      });
    });

    return Array.from(flagsMap.values()) as MultiEnvironmentFlag[];
  }, [entity, envs]);
};
