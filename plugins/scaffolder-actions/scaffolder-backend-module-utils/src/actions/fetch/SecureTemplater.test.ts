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
import { SecureTemplater } from './SecureTemplater';

describe('SecureTemplater', () => {
  it('renders values with the ${{ }} syntax', async () => {
    const render = await SecureTemplater.loadRenderer();
    expect(render('Hello ${{ values.name }}', { values: { name: 'x' } })).toBe(
      'Hello x',
    );
  });

  it('supports cookiecutter syntax and the jsonify filter', async () => {
    const render = await SecureTemplater.loadRenderer({
      cookiecutterCompat: true,
    });
    expect(
      render('{{ cookiecutter.list | jsonify }}', {
        cookiecutter: { list: ['a', 'b'] },
      }),
    ).toBe('["a","b"]');
  });

  it('exposes custom filters and globals', async () => {
    const render = await SecureTemplater.loadRenderer({
      templateFilters: { shout: (s: any) => `${s}!`.toUpperCase() },
      templateGlobals: { greeting: 'hi', twice: (n: any) => n * 2 },
    });
    expect(
      render('${{ greeting | shout }} ${{ twice(21) }}', { values: {} }),
    ).toBe('HI! 42');
  });

  it('honours trimBlocks', async () => {
    const render = await SecureTemplater.loadRenderer({
      nunjucksConfigs: { trimBlocks: true },
    });
    expect(render('{% if true %}\nyes\n{% endif %}\n', {})).toBe('yes\n');
  });

  it('does not let templates reach the host runtime', async () => {
    const render = await SecureTemplater.loadRenderer();
    const payload =
      "${{ range.constructor(\"return global.process.getBuiltinModule('child_process').execSync('echo pwned').toString()\")() }}";
    let output: string | undefined;
    try {
      output = render(payload, {});
    } catch {
      output = undefined;
    }
    expect(output ?? '').not.toContain('pwned');
  });
});
