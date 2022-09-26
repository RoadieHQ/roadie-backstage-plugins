/*
 * Copyright 2022 Larder Software Limited
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

module.exports = {
  '*.{js,jsx,ts,tsx,mjs,cjs}': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
  // Externalized config due to a TSC bug
  // https://github.com/microsoft/TypeScript/issues/27379
  '**/*.ts?(x)': function () {
    return 'tsc';
  },
};
