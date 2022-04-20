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

module.exports = {
  extends: [require.resolve('@backstage/cli/config/eslint.backend')],
  rules: {
    'notice/notice': 'off',
    // Related issue: https://github.com/typescript-eslint/typescript-eslint/issues/2077
    // I'm not sure which package in the @backstage eslint config that we are extending is
    // causing this issue but one of them is. Eventually the @backstage eslint config will
    // be updated to support V3 of @typescript-eslint and this rule can be defaulted.
    '@typescript-eslint/camelcase': 0,
    'no-console': [0],
  },
};
