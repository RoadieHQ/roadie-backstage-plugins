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

export type BugsnagError = {
  id: string;
  severity: string;
  project_id: string;
  first_seen: string;
  last_seen: string;
  events: number;
  release_stages: string;
  error_class: string;
  users: number;
};

export type Organisation = {
  id: string;
  name: string;
  slug: string;
};

export type Project = {
  id: string;
  api_key:string;
  slug: string;
  name: string;
};
