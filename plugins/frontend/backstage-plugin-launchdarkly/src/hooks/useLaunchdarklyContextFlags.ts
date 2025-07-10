import { Entity } from '@backstage/catalog-model';
import { useAsync } from 'react-use';
import {
  LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION,
  LAUNCHDARKLY_FILTER_QUERY_ANNOTATION,
  LAUNCHDARKLY_FILTER_TAGS_ANNOTATION,
  LAUNCHDARKLY_PROJECT_KEY_ANNOTATION,
} from '../constants';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';

export type ContextFlag = {
  name: string;
  key: string;
  status: string;
  environmentKey: string;
  link: string;
  variations?: Array<{
    value: any;
    name?: string;
    description?: string;
  }>;
};

export const useLaunchdarklyContextFlags = (entity: Entity) => {
  const discovery = useApi(discoveryApiRef);

  return useAsync(async () => {
    const projectKey =
      entity.metadata.annotations?.[LAUNCHDARKLY_PROJECT_KEY_ANNOTATION] ||
      'default';
    const environmentKey =
      entity.metadata.annotations?.[LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION] ||
      'production';
    const tags =
      entity.metadata.annotations?.[LAUNCHDARKLY_FILTER_TAGS_ANNOTATION];
    const query =
      entity.metadata.annotations?.[LAUNCHDARKLY_FILTER_QUERY_ANNOTATION];

    const filters: string[] = [];

    if (tags) {
      filters.push(`tags contains ${tags}`);
    }

    if (query) {
      filters.push(`query equals ${query}`);
    }

    const filterQueryParam =
      filters.length > 0 ? `&filter=${filters.join(', ')}` : '';

    const url = `${await discovery.getBaseUrl('proxy')}/launchdarkly/api`;
    const response = await fetch(
      `${url}/v2/flags/${projectKey}?env=${environmentKey}&limit=100&offset=0${filterQueryParam}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to retrieve LaunchDarkly flags for project ${projectKey}: ${response.statusText}`,
      );
    }

    const flags = (await response.json()).items;
    // Fetch environment-specific information for each flag
    const contextFlags = await Promise.all(
      flags.map(async (flag: any) => {
        const link = `https://app.launchdarkly.com/projects/${projectKey}/flags/${flag.key}/targeting?env=${environmentKey}&selected-env=${environmentKey}`;
        try {
          const envDetails = flag.environments[environmentKey];

          return {
            name: flag.name,
            key: flag.key,
            status: envDetails?.on
              ? `${envDetails._environmentName}: Enabled`
              : `${envDetails._environmentName}: Disabled`,
            environmentKey,
            link: link,
            variations: flag.variations,
          };
        } catch (error) {
          // Silently continue if we can't fetch details for a flag
        }

        return {
          name: flag.name,
          key: flag.key,
          status: 'Unknown',
          environmentKey,
          link: link,
        };
      }),
    );

    return contextFlags;
  });
};
