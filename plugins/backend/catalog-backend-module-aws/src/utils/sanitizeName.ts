/*
 * Copyright 2025 Larder Software Limited
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
import { stripBoundingSpecials } from './stripBoundingSpecials';

/**
 * From the Backstage docs, a valid `name`:
 *
 * 1. Must be a string of length at least 1, and at most 63
 * 2. Must consist of sequences of [a-z0-9A-Z] possibly separated by one of [-_.]
 *
 * Note: [-_.] cannot be the first or last character.
 */
export function sanitizeName(value: string) {
  const val = value.replaceAll(/[^a-zA-Z0-9-_.]/g, '-');
  return stripBoundingSpecials(val).substring(0, 63);
}

/**
 * Similar to `sanitizeName`, but only allows dashes as separators. This is useful for cases where underscores or
 * periods are not allowed, such as Kubernetes label names.
 */
export function sanitizeNameDashesOnly(value: string) {
  const val = value.replaceAll(/[^a-zA-Z0-9-]/g, '-');
  return stripBoundingSpecials(val).substring(0, 63);
}

/**
 * Similar to `sanitizeName`, but retains slashes and colons. This is useful for cases where the name is used
 * as part of a resource reference, such as an entity ref.
 */
export function sanitizeNameAsRef(value: string): string {
  const val = value.replaceAll(/^[^a-zA-Z0-9-_./:]/g, '-');
  return stripBoundingSpecials(val);
}
