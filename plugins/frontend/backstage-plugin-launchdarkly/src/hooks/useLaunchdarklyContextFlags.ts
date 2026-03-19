import { Entity } from '@backstage/catalog-model';
import { useAsync } from 'react-use';
import {
  LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION,
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
  description?: string;
  tags?: string[];
  maintainer?: string;
  evaluationDetails?: any;
  isEvaluated?: boolean;
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
    const cntxt =
      entity.metadata.annotations?.[LAUNCHDARKLY_CONTEXT_PROPERTIES_ANNOTATION];
    const filters: string[] = [];
    const flagFilters: string[] = [];

    if (tags) {
      filters.push(`tags contains ${tags}`);
    }

    if (query) {
      filters.push(`query equals ${query}`);

      flagFilters.push(`query:${query}`);
    }

    const filterQueryParam =
      filters.length > 0 ? `&filter=${filters.join(', ')}` : '';
    const flagFilterQueryParam =
      flagFilters.length > 0 ? `&filter=${flagFilters.join(', ')}` : '';

    const url = `${await discovery.getBaseUrl('proxy')}/launchdarkly/api`;

    // evaluate flags for a specific context
    const evaluateResponse = await fetch(
      `${url}/v2/projects/${projectKey}/environments/${environmentKey}/flags/evaluate${
        filterQueryParam ? `?${filterQueryParam}` : ''
      }`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: cntxt,
      },
    );

    if (!evaluateResponse.ok) {
      throw new Error(
        `Failed to retrieve LaunchDarkly flags for project ${projectKey}: ${evaluateResponse.statusText}`,
      );
    }

    // get all flags for the project and environment
    const allFlagsResponse = await fetch(
      `${url}/v2/flags/${projectKey}?env=${environmentKey}&limit=100&offset=0${
        flagFilterQueryParam ? `${flagFilterQueryParam}` : ''
      }`,
    );

    if (!allFlagsResponse.ok) {
      throw new Error(
        `Failed to retrieve all LaunchDarkly flags for project ${projectKey}: ${allFlagsResponse.statusText}`,
      );
    }

    const evaluatedFlags = (await evaluateResponse.json()).items || [];
    const allFlags = (await allFlagsResponse.json()).items || [];

    const allFlagsMap = new Map();
    allFlags.forEach((flag: any) => {
      allFlagsMap.set(flag.key, flag);
    });

    const createFlagEntry = (flag: any, evaluatedFlag?: any) => {
      const link = `https://app.launchdarkly.com/projects/${projectKey}/flags/${flag.key}/targeting?env=${environmentKey}&selected-env=${environmentKey}`;

      const status = evaluatedFlag._value ? 'Enabled' : 'Disabled';
      const evaluationDetails = evaluatedFlag.evaluationDetails || null;

      return {
        name: flag.name,
        key: flag.key,
        status,
        environmentKey,
        link,
        variations: flag.variations,
        description: flag.description,
        tags: flag.tags,
        maintainer: flag.maintainer,
        evaluationDetails,
      };
    };

    return evaluatedFlags.map((evaluatedFlag: any) => {
      const allFlag = allFlagsMap.get(evaluatedFlag.key);
      const flagData = allFlag || evaluatedFlag;
      return createFlagEntry(flagData, evaluatedFlag);
    });
  });
};
