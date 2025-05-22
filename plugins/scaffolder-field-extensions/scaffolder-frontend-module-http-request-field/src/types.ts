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
import { z } from 'zod';

export type OAuthConfig = {
  provider: 'microsoft' | 'github' | 'google' | 'bitbucket';
  scopes: string[];
};

export const selectFieldFromApiConfigSchema = z.object({
  params: z
    .record(z.string(), z.string())
    .optional()
    .or(z.array(z.record(z.string(), z.string())).optional()),
  path: z.string(),
  arraySelector: z.string().or(z.array(z.string())).optional(),
  valueSelector: z.string().or(z.array(z.string())).optional(),
  labelSelector: z.string().or(z.array(z.string())).optional(),
  title: z.string().optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  successStatusCode: z.number().optional(),
  oauth: z
    .object({
      provider: z.enum(['microsoft', 'github', 'bitbucket', 'google']),
      scopes: z.array(z.string()),
    })
    .optional(),
});
