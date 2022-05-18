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

import { useEffect, useCallback } from 'react';
import convert from 'xml-js';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { useApi } from '@backstage/core-plugin-api';
import { useAsyncFn } from 'react-use';
import { handleError } from './utils';
import {
  ActivityStreamEntry,
  ActivityStreamElement,
  ActivityStreamKeys,
} from '../types';
import { jiraApiRef } from '../api';

const getPropertyValue = (
  entry: ActivityStreamEntry,
  property: ActivityStreamKeys,
): string => entry[property]?._text;
const getElapsedTime = (start: string) => moment(start).fromNow();
const decodeHtml = (html: string) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

export const useActivityStream = (
  size: number,
  projectKey: string,
  componentName: string | undefined,
  ticketIds: string[] | undefined,
  isBearerAuth: boolean
) => {
  const api = useApi(jiraApiRef);

  const getActivityStream = useCallback(async () => {
    try {
      const response = await api.getActivityStream(size, projectKey, componentName, ticketIds, isBearerAuth);
      const parsedData = JSON.parse(
        convert.xml2json(response, { compact: true, spaces: 2 }),
      );
      const mappedData = parsedData.feed.entry.map(
        (entry: ActivityStreamEntry): ActivityStreamElement => {
          const id = `urn:uuid:${uuidv4()}`;
          const time = getPropertyValue(entry, 'updated');
          const iconLink = entry.link?.find(
            link =>
              link._attributes.rel ===
              'http://streams.atlassian.com/syndication/icon',
          );
          let icon;
          if (iconLink) {
            icon = {
              url: iconLink._attributes.href,
              title: iconLink._attributes.title,
            };
          }
          return {
            id: id,
            time: {
              elapsed: getElapsedTime(time),
              value: new Date(time).toLocaleTimeString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            },
            title: decodeHtml(getPropertyValue(entry, 'title')),
            icon: icon,
            summary: decodeHtml(getPropertyValue(entry, 'summary') || ''),
            content: decodeHtml(getPropertyValue(entry, 'content') || ''),
          };
        },
      );
      return mappedData as Array<ActivityStreamElement>;
    } catch (err:any) {
      return handleError(err);
    }
  }, [api, size, projectKey, componentName, ticketIds, isBearerAuth]);

  const [state, fetchActivityStream] = useAsyncFn(() => getActivityStream(), [
    size,
  ]);

  useEffect(() => {
    fetchActivityStream();
  }, [size, fetchActivityStream]);

  return {
    activitiesLoading: state.loading,
    activities: state.value,
    activitiesError: state.error,
  };
};
