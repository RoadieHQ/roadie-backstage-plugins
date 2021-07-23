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

import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRouteRef,
} from '@backstage/core-plugin-api';
import { awsLambdaApiRef, AwsLambdaClient } from './api';

export const entityContentRouteRef = createRouteRef({
  title: 'AWS Lambda Entity Content',
});

export const awsLambdaPlugin = createPlugin({
  id: 'aws-lambda',
  apis: [createApiFactory(awsLambdaApiRef, new AwsLambdaClient())],
  routes: {
    entityContent: entityContentRouteRef,
  },
});

export const EntityAWSLambdaOverviewCard = awsLambdaPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/AWSLambdaOverview/AWSLambdaOverview').then(
          (m) => m.AWSLambdaOverviewWidget
        ),
    },
  })
);
