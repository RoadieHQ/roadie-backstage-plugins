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

import { useLocalStorage } from 'react-use';
import { IssuesCounter } from '../types';

export type IssuetypeType = 'non-empty' | 'all';

export const useEmptyIssueTypeFilter = (
  issueTypes: IssuesCounter[] | undefined,
) => {
  const [type, setType] = useLocalStorage<IssuetypeType>(
    'jira-plugin-issuetype-filter',
    'non-empty',
  );

  return {
    issueTypes:
      type === 'non-empty'
        ? issueTypes?.filter(t => t.total !== 0)
        : issueTypes,
    type,
    changeType:
      type === 'non-empty' ? () => setType('all') : () => setType('non-empty'),
  };
};
