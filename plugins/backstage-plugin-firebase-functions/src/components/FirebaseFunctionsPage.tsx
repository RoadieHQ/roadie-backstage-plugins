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

import React from 'react';
import { ContentHeader, SupportButton } from '@backstage/core-components';

import { FirebaseFunctionsPageTable } from './FirebaseFunctionsPageTable';
import { ContextProvider } from './ContextProvider';
import { Entity } from '@backstage/catalog-model';
import { isMoreThanOneFirebaseFunction } from './util';
import { FirebaseFunctionDetailsPage } from './FirebaseFunctionDetailsPage';

type Props = { entity: Entity };
const FirebaseFunctionsPage: React.FC<Props> = ({ entity }: Props) => {
  return (
    <ContextProvider entity={entity}>
      <ContentHeader title="Firebase Functions">
        <SupportButton>
          Plugin to show a project's firebase functions
        </SupportButton>
      </ContentHeader>
      {isMoreThanOneFirebaseFunction(entity) ? (
        <FirebaseFunctionsPageTable />
      ) : (
        <FirebaseFunctionDetailsPage />
      )}
    </ContextProvider>
  );
};

export default FirebaseFunctionsPage;
