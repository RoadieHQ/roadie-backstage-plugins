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

import { useEntity } from "@backstage/plugin-catalog-react";

export const FIREBASE_FUNCTION_IDS = 'cloud.google.com/function-ids';

export const useFunctionIds = () => {
  const { entity } = useEntity()
  const rawProjects =
    entity?.metadata.annotations?.[FIREBASE_FUNCTION_IDS] ?? '';
  const functions = rawProjects.split(',').map(p => p.trim());
  const availableProjects = [...new Set(functions.map(f => f.split('/')[1]))].filter(it => it);
  return { availableProjects, functions };
};
