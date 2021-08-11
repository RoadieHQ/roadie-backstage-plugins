/*
 * Copyright 2020 RoadieHQ
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

import { ApiRef, createApiRef } from '@backstage/core-plugin-api';
import { FunctionData } from '../types';

export const firebaseFunctionsApiRef: ApiRef<FirebaseFunctionsApi> = createApiRef<
  FirebaseFunctionsApi
>({
  id: 'plugin.firebasefunctions.service',
  description: 'Used by the firebase functions plugin to make requests',
});

export type ListFunctionsArgs = {
  googleIdToken: string;
  projects: string[];
};

export type ListFunctionsType = (
  input: ListFunctionsArgs,
) => Promise<{
  functionData: FunctionData[];
}>;

export type GetFunctionArgs = {
  googleIdToken: string;
  functionSlug: string;
};

export type GetFunctionType = (input: GetFunctionArgs) => Promise<FunctionData>;

export type FirebaseFunctionsApi = {
  listFunctions: ListFunctionsType;
  getFunction: GetFunctionType;
};
