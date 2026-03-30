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
import { ILoader, Loader } from 'nunjucks';

import baseTemplateContent from '../../providers/AWSEntityProvider.base.yaml.njk';

/**
 * This template loader is only used so that the base template can be
 * referenced by other templates using the nunjucks `{% extends %}` syntax.
 */
export class BaseTemplateLoader extends Loader implements ILoader {
  getSource(name: string) {
    if (name !== 'AWSEntityProvider.base.yaml') {
      throw new Error(`Template not found: ${name}`);
    }
    return { src: baseTemplateContent, path: name, noCache: true };
  }
}
