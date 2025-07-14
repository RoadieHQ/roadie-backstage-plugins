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

import { createContext, FC, useReducer, Dispatch, Reducer } from 'react';
import { awsLambdaApiRef } from '../api';
import { State, Action } from './types';

export const AppContext = createContext<[State, Dispatch<Action>]>(
  [] as any,
);
export const STORAGE_KEY = `${awsLambdaApiRef.id}.settings`;

const initialState: State = {
  region: '',
  identityPoolId: '',
  showSettings: false,
  authMethod: 'aws',
  awsAccessKeyId: '',
  awsAccessKeySecret: '',
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'setCredentials':
      return {
        ...state,
        ...action.payload,
      };
    case 'showSettings':
      return { ...state, showSettings: true };
    case 'hideSettings':
      return { ...state, showSettings: false };
    default:
      return state;
  }
};

export const AppStateProvider: FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={[state, dispatch]}>
      <>{children}</>
    </AppContext.Provider>
  );
};
