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

export const ErrorsMock = [{
  id: "123456qwerty!!",
  severity: "warning",
  project_id: "0987qwert!!",
  first_seen: "2021-09-05T09:17:17.384804Z",
  last_seen: "2021-09-20T09:17:17.384804Z",
  events: 3,
  release_stages: 'Development',
  error_class: 'Error',
  users: 5
},
{
  id: "123456qwerty2!!",
  severity: "warning",
  project_id: "0987qwert!!",
  first_seen: "2021-09-11T09:17:17.384804Z",
  last_seen: "2021-09-20T09:17:17.384804Z",
  events: 3,
  release_stages: 'Development',
  error_class: 'Error',
  users: 5

},
{
  id: "123456qwerty3!!",
  severity: "warning",
  project_id: "0987qwert!!",
  first_seen: "2021-09-06T09:17:17.384804Z",
  last_seen: "2021-09-10T09:17:17.384804Z",
  events: 3,
  release_stages: 'Development',
  error_class: 'Error',
  users: 5

},
{
  id: "123456qwerty4!!",
  severity: "error",
  project_id: "0987qwert!!",
  first_seen: "2021-09-15T09:17:17.384804Z",
  last_seen: "2021-09-20T09:17:17.384804Z",
  events: 3,
  release_stages: 'Development',
  error_class: 'SyntaxError',
  users: 5

}];

export const OrganisationsMock = [
  {
    id: "129876sdfgh",
    name: "Roadie test Organization",
    slug: "roadie-test-organisation"
  },
  {
    id: "1119876sdfgh",
    name: "Roadie test2 Organization",
    slug: "roadie-test2-organisation"
  },
];

export const ProjectsMock = [{
  id: "0987qwert!!",
  api_key: "1234569876543",
  name: "Test bugsnag application",
  slug: "test-bugsnag-app"
}];

export const TrendsMock = [{
  from: "2021-09-05T09:17:17.384804Z",
  to: "2021-09-15T09:17:17.384804Z",
  events_count: 6
},
{
  from: "2021-09-05T09:17:17.384804Z",
  to: "2021-09-15T09:17:17.384804Z",
  events_count: 3
},
{
  from: "2021-09-05T09:17:17.384804Z",
  to: "2021-09-15T09:17:17.384804Z",
  events_count: 3
},
{
  from: "2021-09-05T09:17:17.384804Z",
  to: "2021-09-15T09:17:17.384804Z",
  events_count: 2
}];


