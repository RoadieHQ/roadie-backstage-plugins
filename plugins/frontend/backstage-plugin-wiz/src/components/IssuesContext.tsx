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
import { createContext, ReactNode, useContext } from 'react';
import { WIZ_PROJECT_ANNOTATION } from './constants';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { wizApiRef } from '../api';
import { useAsync } from 'react-use';
import { WizIssue } from './Issues/types';

interface IssuesContextType {
  issues: WizIssue[] | undefined;
  loading: boolean;
  error: Error | undefined;
}

export const IssuesContext = createContext<IssuesContextType | undefined>(
  undefined,
);

export const IssuesProvider = ({ children }: { children: ReactNode }) => {
  const { entity } = useEntity();
  const api = useApi(wizApiRef);

  const wizAnnotation =
    entity?.metadata.annotations?.[WIZ_PROJECT_ANNOTATION] ?? '';

  const fetchIssues = async () => {
    const response = await api.fetchIssuesForProject(wizAnnotation);
    return response;
  };

  const { value: issues, loading, error } = useAsync(fetchIssues, []);

  return (
    <IssuesContext.Provider value={{ issues, loading, error }}>
      {children}
    </IssuesContext.Provider>
  );
};

export const useIssues = () => {
  const context = useContext(IssuesContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssuesProvider');
  }
  return context;
};
