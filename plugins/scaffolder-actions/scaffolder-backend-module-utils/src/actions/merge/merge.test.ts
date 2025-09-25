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

import { PassThrough } from 'stream';
import { getVoidLogger, resolveSafeChildPath } from '@backstage/backend-common';
import { createMergeAction, createMergeJSONAction } from './merge';
import mock from 'mock-fs';
import fs from 'fs-extra';
import YAML, { Scalar } from 'yaml';
import detectIndent from 'detect-indent';

describe('roadiehq:utils:json:merge', () => {
  beforeEach(() => {
    mock({
      'fake-tmp-dir': {},
    });
  });
  afterEach(() => mock.restore());
  const mockContext = {
    task: {
      id: 'task-id',
    },
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
    checkpoint: jest.fn(),
    getInitiatorCredentials: jest.fn(),
    workspacePath: 'lol',
  };

  const action = createMergeJSONAction({});

  it('should throw error when required parameter path is not provided', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: { content: '' } as any,
      }),
    ).rejects.toThrow(/argument must be of type string/);
  });

  it('should throw an error when the source file is not json', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json': 'not json',
      },
    });

    await expect(
      action.handler({
        ...mockContext,
        workspacePath: 'fake-tmp-dir',
        input: {
          path: 'fake-file.json',
          content: {
            foo: 'bar',
          },
        },
      }),
    ).rejects.toThrow(/Unexpected token/);
  });

  it('should write file to the workspacePath with the given content if it doesnt exist', async () => {
    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        content: {
          foo: 'bar',
        },
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.json')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.json', 'utf-8');
    expect(JSON.parse(file)).toEqual({ foo: 'bar' });
  });

  it('should append the content to the file if it already exists', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json':
          '{ "scripts": { "lsltr": "ls -ltr" }, "array": ["first item"] }',
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        content: {
          scripts: {
            lsltrh: 'ls -ltrh',
          },
          array: ['second item'],
        },
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.json')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.json', 'utf-8');
    expect(JSON.parse(file)).toEqual({
      scripts: { lsltr: 'ls -ltr', lsltrh: 'ls -ltrh' },
      array: ['second item'],
    });
  });

  it('should merge arrays if configured', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json':
          '{ "scripts": { "lsltr": "ls -ltr" }, "array": ["first item"] }',
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        mergeArrays: true,
        content: {
          scripts: {
            lsltrh: 'ls -ltrh',
          },
          array: ['second item'],
        },
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.json')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.json', 'utf-8');
    expect(JSON.parse(file)).toEqual({
      scripts: {
        lsltr: 'ls -ltr',
        lsltrh: 'ls -ltrh',
      },
      array: ['first item', 'second item'],
    });
  });

  it('should merge and replace arrays if configured', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json':
          '{ "scripts": { "lsltr": "ls -ltr" }, "array": ["first item", "second item"] }',
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        content: {
          scripts: {
            lsltrh: 'ls -ltrh',
          },
          array: ['third item'],
        },
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.json')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.json', 'utf-8');
    expect(JSON.parse(file)).toEqual({
      scripts: {
        lsltr: 'ls -ltr',
        lsltrh: 'ls -ltrh',
      },
      array: ['third item'],
    });
  });

  it('should put path on the output property', async () => {
    const ctx = {
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        content: {
          foo: 'bar',
        },
      },
    };
    await action.handler(ctx);

    expect(ctx.output.mock.calls[0][0]).toEqual('path');
    expect(ctx.output.mock.calls[0][1]).toContain(
      '/fake-tmp-dir/fake-file.json',
    );
  });

  it('can handle json text input', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json': '{ "scripts": { "lsltr": "ls -ltr" } }',
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        content: '{"scripts": { "lsltrh": "ls -ltrh" } }',
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.json')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.json', 'utf-8');
    expect(JSON.parse(file)).toEqual({
      scripts: { lsltr: 'ls -ltr', lsltrh: 'ls -ltrh' },
    });
  });

  it('output file indentation should match default file indentation of 2 spaces', async () => {
    const jsonData = {
      scripts: {
        lsltr: 'ls -ltr',
      },
      array: ['first item'],
    };
    mock({
      'fake-tmp-dir': {
        'fake-file.json': JSON.stringify(jsonData, null, 4),
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        mergeArrays: true,
        content: {
          scripts: {
            lsltrh: 'ls -ltrh',
          },
          array: ['second item'],
        },
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.json')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.json', 'utf-8');
    expect(JSON.parse(file)).toEqual({
      scripts: {
        lsltr: 'ls -ltr',
        lsltrh: 'ls -ltrh',
      },
      array: ['first item', 'second item'],
    });
    expect(detectIndent(file).amount).toBe(2);
  });

  it('output file indentation should match input file indentation', async () => {
    const jsonData = {
      scripts: {
        lsltr: 'ls -ltr',
      },
      array: ['first item'],
    };
    mock({
      'fake-tmp-dir': {
        'fake-file.json': JSON.stringify(jsonData, null, 4),
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        mergeArrays: true,
        matchFileIndent: true,
        content: {
          scripts: {
            lsltrh: 'ls -ltrh',
          },
          array: ['second item'],
        },
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.json')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.json', 'utf-8');
    expect(JSON.parse(file)).toEqual({
      scripts: {
        lsltr: 'ls -ltr',
        lsltrh: 'ls -ltrh',
      },
      array: ['first item', 'second item'],
    });
    expect(detectIndent(file).amount).toBe(4);
  });
});

describe('roadiehq:utils:merge', () => {
  beforeEach(() => {
    mock({
      'fake-tmp-dir': {},
    });
  });
  afterEach(() => mock.restore());
  const mockContext = {
    task: {
      id: 'task-id',
    },
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
    checkpoint: jest.fn(),
    getInitiatorCredentials: jest.fn(),
    workspacePath: 'lol',
  };

  const action = createMergeAction();

  it('should throw error when required parameter path is not provided', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: { content: '' } as any,
      }),
    ).rejects.toThrow(/argument must be of type string/);
  });

  it('should throw an error when the source file does not exist', async () => {
    await expect(
      action.handler({
        ...mockContext,
        workspacePath: 'fake-tmp-dir',
        input: {
          path: 'fake-file.json',
          content: {
            foo: 'bar',
          },
        },
      }),
    ).rejects.toThrow(
      /The file (.*)fake-tmp-dir\/fake-file.json does not exist./,
    );
  });

  it('can merge content into a json file', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json': '{ "scripts": { "lsltr": "ls -ltr" } }',
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        content: {
          scripts: {
            lsltrh: 'ls -ltrh',
          },
        },
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.json')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.json', 'utf-8');
    expect(JSON.parse(file)).toEqual({
      scripts: { lsltr: 'ls -ltr', lsltrh: 'ls -ltrh' },
    });
  });

  it('can handle json text input', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json': '{ "scripts": { "lsltr": "ls -ltr" } }',
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        content: '{"scripts": { "lsltrh": "ls -ltrh" } }',
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.json')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.json', 'utf-8');
    expect(JSON.parse(file)).toEqual({
      scripts: { lsltr: 'ls -ltr', lsltrh: 'ls -ltrh' },
    });
  });

  it('can handle yaml text input', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': 'scripts:\n  lsltr: ls -ltr\n',
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        content: `
scripts:
  lsltrh: 'ls -ltrh'
`,
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.yaml', 'utf-8');
    expect(YAML.parse(file)).toEqual({
      scripts: { lsltr: 'ls -ltr', lsltrh: 'ls -ltrh' },
    });
  });

  it('can merge content into a yaml file', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': 'array: ["first item"]\nscripts:\n  lsltr: ls -ltr\n',
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        content: {
          scripts: {
            lsltrh: 'ls -ltrh',
          },
          array: ['second item'],
        },
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.yaml', 'utf-8');
    expect(YAML.parse(file)).toEqual({
      scripts: { lsltr: 'ls -ltr', lsltrh: 'ls -ltrh' },
      array: ['second item'],
    });
  });

  it('can merge arrays if configured', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': "array: ['first item']",
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        mergeArrays: true,
        content: {
          array: ['second item'],
        },
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.yaml', 'utf-8');
    expect(YAML.parse(file)).toEqual({
      array: ['first item', 'second item'],
    });
  });

  it('should respect noArrayIndent option when merging YAML files', async () => {
    const originalYaml = `apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- ../../blah/blah

images:
- name: blahblahblah.ecr.eu-central-1.amazonaws.com/blah/blah
  newTag: blahblahblah
components:
- ../../../../blah/blah/blah
- ../../../blah/blah/blah`;

    mock({
      'fake-tmp-dir': {
        'kustomization.yaml': originalYaml,
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'kustomization.yaml',
        options: {
          indentSeq: false,
        },
        content: {
          components: ['../../../blah/blah/new-component'],
        },
        mergeArrays: true,
      },
    });

    expect(fs.existsSync('fake-tmp-dir/kustomization.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/kustomization.yaml', 'utf-8');

    // With noArrayIndent: true, arrays should not be indented
    expect(file).toContain('resources:\n- ../../blah/blah');
    expect(file).toContain(
      'images:\n- name: blahblahblah.ecr.eu-central-1.amazonaws.com/blah/blah',
    );
    expect(file).toContain('components:\n- ../../../../blah/blah/blah');
    expect(file).toContain('- ../../../blah/blah/new-component');

    // Arrays should not be indented (should not contain '  - ')
    expect(file).not.toContain('resources:\n  - ../../blah/blah');
    expect(file).not.toContain('images:\n  - name:');
    expect(file).not.toContain('components:\n  - ../../../../blah/blah/blah');
  });

  it('can pass options to YAML.stringify', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': 'zoo: bar',
      },
    });

    const opts = {
      blockQuote: true,
      collectionStyle: 'block' as 'any' | 'block' | 'flow',
      defaultKeyType: 'PLAIN' as Scalar.Type,
      defaultStringType: 'BLOCK_LITERAL' as Scalar.Type,
      directives: false,
      doubleQuotedAsJSON: false,
      doubleQuotedMinMultiLineLength: 40,
      falseStr: 'false',
      flowCollectionPadding: false,
      indent: 4,
      indentSeq: false,
      lineWidth: -1,
      minContentWidth: 20,
      nullStr: 'null',
      simpleKeys: false,
      singleQuote: false,
      trueStr: 'true',
    };

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        content: YAML.stringify({ foo: { bar: { nested: 'deep' } } }),
        options: opts,
      },
    });
    const expectedPath = resolveSafeChildPath('fake-tmp-dir', 'fake-file.yaml');

    expect(mockContext.output).toHaveBeenCalledWith('path', expectedPath);
    const expectedContent = fs.readFileSync(expectedPath, 'utf-8');
    expect(expectedContent).toEqual(
      YAML.stringify({ zoo: 'bar', foo: { bar: { nested: 'deep' } } }, opts),
    );
  });

  it('should put path on the output property', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.json': '{ "scripts": { "lsltr": "ls -ltr" } }',
      },
    });

    const ctx = {
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.json',
        content: {
          foo: 'bar',
        },
      },
    };
    await action.handler(ctx);

    expect(ctx.output.mock.calls[0][0]).toEqual('path');
    expect(ctx.output.mock.calls[0][1]).toContain(
      '/fake-tmp-dir/fake-file.json',
    );
  });

  it('should preserve YAML comments when merging', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': `
# Top-level comment
scripts: # Trailing comment
  # Nested comment
  lsltr: ls -ltr
  #Comment without space
`,
      },
    });

    const opts = {
      indent: 3,
      noArrayIndent: true,
      skipInvalid: true,
      flowLevel: 23,
      sortKeys: true,
      lineWidth: -1,
      noRefs: true,
      noCompatMode: true,
      condenseFlow: true,
      quotingType: '"' as const,
      forceQuotes: true,
    };

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        content: {
          scripts: {
            lsltrh: 'ls -ltrh',
          },
        },
        preserveYamlComments: true,
        options: opts,
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.yaml', 'utf-8');
    expect(file).toContain('# Top-level comment');
    expect(file).toContain('# Trailing comment');
    expect(file).toContain('# Nested comment');
    expect(file).toContain('#Comment without space');
    expect(YAML.parse(file)).toEqual({
      scripts: { lsltr: 'ls -ltr', lsltrh: 'ls -ltrh' },
    });
  });

  it('should not preserve YAML comments when preserveYamlComments is false', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': `
# Top-level comment
scripts: # Trailing comment
  # Nested comment
  lsltr: ls -ltr
  #Comment without space
`,
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        content: {
          scripts: {
            lsltrh: 'ls -ltrh',
          },
        },
        preserveYamlComments: false,
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.yaml', 'utf-8');
    expect(file).not.toContain('# Top-level comment');
    expect(file).not.toContain('# Trailing comment');
    expect(file).not.toContain('# Nested comment');
    expect(file).not.toContain('#Comment without space');
    expect(YAML.parse(file)).toEqual({
      scripts: { lsltr: 'ls -ltr', lsltrh: 'ls -ltrh' },
    });
  });

  it('should merge content into the correct YAML document', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': `
---
id: 1
name: Document 1
---
id: 2
scripts:
  lsltr: ls -ltr
---
id: 3
name: Document 3
`,
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        content: YAML.stringify({
          scripts: {
            lsltrh: 'ls -ltrh',
          },
        }),
        useDocumentIncludingField: {
          key: 'id',
          value: '2',
        },
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.yaml', 'utf-8');
    const documents = YAML.parseAllDocuments(file);
    expect(documents[0].toJSON()).toEqual({
      id: 1,
      name: 'Document 1',
    });
    expect(documents[1].toJSON()).toEqual({
      id: 2,
      scripts: {
        lsltr: 'ls -ltr',
        lsltrh: 'ls -ltrh',
      },
    });
    expect(documents[2].toJSON()).toEqual({
      id: 3,
      name: 'Document 3',
    });
  });

  it('should merge content into the correct YAML document and preserve comments', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': `
---
id: 1
name: Document 1
# Comment for document 1
---
id: 2
scripts:
  lsltr: ls -ltr # Inline comment
# Comment for document 2
---
id: 3
name: Document 3
# Comment for document 3
`,
      },
    });

    await action.handler({
      ...mockContext,
      workspacePath: 'fake-tmp-dir',
      input: {
        path: 'fake-file.yaml',
        content: YAML.stringify({
          scripts: {
            lsltrh: 'ls -ltrh',
          },
        }),
        useDocumentIncludingField: {
          key: 'id',
          value: '2',
        },
        preserveYamlComments: true,
      },
    });

    expect(fs.existsSync('fake-tmp-dir/fake-file.yaml')).toBe(true);
    const file = fs.readFileSync('fake-tmp-dir/fake-file.yaml', 'utf-8');
    const documents = YAML.parseAllDocuments(file);
    expect(documents[0].toJSON()).toEqual({
      id: 1,
      name: 'Document 1',
    });
    expect(file).toContain('# Inline comment');
    expect(file).toContain('# Comment for document 2');
    expect(documents[1].toJSON()).toEqual({
      id: 2,
      scripts: {
        lsltr: 'ls -ltr',
        lsltrh: 'ls -ltrh',
      },
    });
    expect(file).toContain('# Comment for document 3');
    expect(documents[2].toJSON()).toEqual({
      id: 3,
      name: 'Document 3',
    });
  });

  it('should throw error when multiple yaml documents exist, but useDocumentIncludingField is missing', async () => {
    mock({
      'fake-tmp-dir': {
        'fake-file.yaml': `
---
id: 1
name: Document 1
---
id: 2
scripts:
  lsltr: ls -ltr
---
id: 3
name: Document 3
`,
      },
    });

    await expect(
      action.handler({
        ...mockContext,
        workspacePath: 'fake-tmp-dir',
        input: {
          path: 'fake-file.yaml',
          content: YAML.stringify({
            scripts: {
              lsltrh: 'ls -ltrh',
            },
          }),
        },
      }),
    ).rejects.toThrow(
      'Multiple documents found in the input content. Please provide a key and value to use to find the document to merge into.',
    );
  });
});
