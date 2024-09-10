import { Entity } from '@backstage/catalog-model';
import { useAsync } from 'react-use';
import {
  LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION,
  LAUNCHDARKLY_PROJECT_KEY_ANNOTATION,
} from '../constants';
import { discoveryApiRef, useApi } from '@backstage/core-plugin-api';

export type ProjectFlag = {
  creationDate: number;
  version: number;
  name: string;
  _maintainer: {
    email: string;
  };
  kind: string;
};

export const useLaunchdarklyProjectFlags = (entity: Entity) => {
  const discovery = useApi(discoveryApiRef);

  return useAsync(async () => {
    const projectKey =
      entity.metadata.annotations?.[LAUNCHDARKLY_PROJECT_KEY_ANNOTATION] ||
      'default';
    const environmentKey =
      entity.metadata.annotations?.[LAUNCHDARKLY_ENVIRONMENT_KEY_ANNOTATION] ||
      'production';

    const url = `${await discovery.getBaseUrl('proxy')}/launchdarkly/api`;
    const response = await fetch(
      `${url}/v2/flags/${projectKey}?limit=100&offset=0`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to retrieve LaunchDarkly environment ${environmentKey}: ${response.statusText}`,
      );
    }

    return (await response.json()).items as Array<ProjectFlag>;
  });
};
