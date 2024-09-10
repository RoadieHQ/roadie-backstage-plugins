import { Entity } from '@backstage/catalog-model';
import { useAsync } from 'react-use';
import {
  LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION,
  LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION,
  LAUNCHDARKLY_PROJECT_KEY_ANNOTATION,
  LAUNCHDARKLY_FILTER_TAGS_ANNOTATION,
  LAUNCHDARKLY_FILTER_QUERY_ANNOTATION,
} from '../constants';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';

export const useLaunchdarklyContextFlags = (entity: Entity) => {
  const discovery = useApi(discoveryApiRef);

  return useAsync(async () => {
    const projectKey =
      entity.metadata.annotations?.[LAUNCHDARKLY_PROJECT_KEY_ANNOTATION] ||
      'default';
    const environmentKey =
      entity.metadata.annotations?.[LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION] ||
      'production';
    const cntxt =
      entity.metadata.annotations?.[LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION];
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

    const filterQueryParam = filters.join(', ');

    if (projectKey && environmentKey && cntxt) {
      const url = `${await discovery.getBaseUrl('proxy')}/launchdarkly/api`;
      const response = await fetch(
        `${url}/v2/projects/${projectKey}/environments/${environmentKey}/flags/evaluate${
          filters.length > 0 ? `?filter=${filterQueryParam}` : ''
        }`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: cntxt,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to retrieve launchdarkly environment ${environmentKey}: ${response.statusText}`,
        );
      }

      return (await response.json()).items;
    }
    return undefined;
  });
};
