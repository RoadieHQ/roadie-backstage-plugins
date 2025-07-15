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

import { FC, createContext, useEffect } from 'react';
import { travisCIApiRef } from '../api';
import { useLocalStorage } from 'react-use';
import { Entity } from '@backstage/catalog-model';

export type Settings = {
  entity: Entity;
};

export const StateContext = createContext<[Settings, React.Dispatch<Settings>]>(
  [] as any,
);
const STORAGE_KEY = `${travisCIApiRef.id}.settings`;

type Props = { entity: Entity; children: JSX.Element };
export const ContextProvider: FC<Props> = ({ entity, children }) => {
  const [settings, setSettings] = useLocalStorage(STORAGE_KEY, { entity });
  if (settings === undefined) {
    throw new Error('Firebase functions plugin settings is undefined');
  }

  useEffect(() => {
    if (settings.entity !== entity) {
      setSettings({ entity });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  return (
    <StateContext.Provider value={[settings, setSettings]}>
      <>{children}</>
    </StateContext.Provider>
  );
};
