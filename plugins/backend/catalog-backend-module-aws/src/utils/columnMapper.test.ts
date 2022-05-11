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

import { mapColumnsToEntityValues } from './columnMapper';

describe('columnMapper', () => {
  const valueMappings = {
    col1: {
      entityPath: 'metadata.annotations."backstage.io/view-url"',
      template:
        'https://aws.web-services.eu-west-1.some-service/{{ value }}/display',
    },
    col2: {
      entityPath: 'metadata."spec.something".something',
    },
  };

  it('should populate fields correctly', () => {
    const mappedEntity = mapColumnsToEntityValues(valueMappings, {
      col1: 'test-value',
      col2: 'test-value2',
    });
    expect(mappedEntity).toMatchObject({
      metadata: {
        annotations: {
          'backstage.io/view-url':
            'https://aws.web-services.eu-west-1.some-service/test-value/display',
        },
        'spec.something': {
          something: 'test-value2',
        },
      },
    });
  });
});
