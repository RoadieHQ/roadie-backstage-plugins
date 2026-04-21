/*
 * Copyright 2026 Larder Software Limited
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

export function buildArgoUrl(baseUrl: string, apiPath: string): string {
  const base = new URL(baseUrl);

  // Split the API path into path and query string
  const [pathPart, queryString] = apiPath.split('?');

  // Remove leading slash from pathPart if present, we'll handle path joining properly
  const cleanApiPath = pathPart.startsWith('/') ? pathPart.slice(1) : pathPart;

  // Preserve the base pathname and append the API path
  // Ensure proper path joining (handle trailing slashes)
  const basePath = base.pathname.endsWith('/')
    ? base.pathname.slice(0, -1) // Remove trailing slash
    : base.pathname;

  base.pathname = basePath ? `${basePath}/${cleanApiPath}` : `/${cleanApiPath}`;

  // If there's a query string in the apiPath, parse and merge it with existing query params
  if (queryString) {
    const queryParams = new URLSearchParams(queryString);
    queryParams.forEach((value, key) => {
      base.searchParams.set(key, value);
    });
  }

  return base.toString();
}
