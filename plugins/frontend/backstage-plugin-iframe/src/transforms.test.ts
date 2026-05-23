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

import type { Entity } from '@backstage/catalog-model';
import { intoTemplate, wrapAnnotation } from './transforms';

const stubEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'svc', namespace: 'default' },
} as Entity;

describe('wrapAnnotation', () => {
  it('prepends a prefix to the annotation value', () => {
    const t = wrapAnnotation('https://grafana.example.com/d/');
    expect(t('abc-123', stubEntity)).toBe(
      'https://grafana.example.com/d/abc-123',
    );
  });

  it('appends an optional suffix after the annotation value', () => {
    const t = wrapAnnotation('https://example.com/foo/', '/extra');
    expect(t('abc-123', stubEntity)).toBe(
      'https://example.com/foo/abc-123/extra',
    );
  });
});

describe('intoTemplate', () => {
  it('substitutes the value at the ${value} token', () => {
    const t = intoTemplate('https://example.com/foo/${value}/extra');
    expect(t('abc-123', stubEntity)).toBe(
      'https://example.com/foo/abc-123/extra',
    );
  });

  it('substitutes every occurrence of the token', () => {
    const t = intoTemplate('https://${value}.example.com/d/${value}');
    expect(t('abc', stubEntity)).toBe('https://abc.example.com/d/abc');
  });

  it('returns the template unchanged when the token is absent', () => {
    const t = intoTemplate('https://example.com/static');
    expect(t('abc', stubEntity)).toBe('https://example.com/static');
  });
});
