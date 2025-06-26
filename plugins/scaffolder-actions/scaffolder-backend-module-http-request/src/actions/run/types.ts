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
export type Headers = {
  [key: string]: string;
};

export type Params = {
  [key: string]: string;
};

export type Methods =
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'POST'
  | 'UPDATE'
  | 'DELETE'
  | 'PUT'
  | 'PATCH';

export type Body = string | undefined;

export interface HttpOptions {
  url: string;
  method: Methods;
  headers: Headers;
  body?: Body;
  timeout?: number;
}
