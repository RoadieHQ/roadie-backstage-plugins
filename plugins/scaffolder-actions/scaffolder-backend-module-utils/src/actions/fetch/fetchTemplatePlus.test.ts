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

import { UrlReaderService } from '@backstage/backend-plugin-api';
import { createMockDirectory } from '@backstage/backend-test-utils';
import { ScmIntegrations } from '@backstage/integration';
import {
  fetchContents,
  TemplateAction,
} from '@backstage/plugin-scaffolder-node';
import { JsonObject } from '@backstage/types';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';
import fs from 'fs-extra';
import { join } from 'path';
import { createFetchTemplatePlusAction } from './fetchTemplatePlus';

jest.mock('@backstage/plugin-scaffolder-node', () => ({
  ...jest.requireActual('@backstage/plugin-scaffolder-node'),
  fetchContents: jest.fn(),
}));

const fetchContentsMock = fetchContents as jest.MockedFunction<
  typeof fetchContents
>;

describe('fetch:template:plus', () => {
  let action: TemplateAction<any, any, 'v2'>;

  const mockDir = createMockDirectory();
  const workspacePath = mockDir.resolve('workspace');

  const mockContext = (input: JsonObject) =>
    createMockActionContext({
      templateInfo: {
        baseUrl: 'https://github.com/org/repo/blob/main/template.yaml',
        entityRef: 'template:default/test-template',
      },
      input,
      workspacePath,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDir.setContent({ workspace: {} });

    fetchContentsMock.mockImplementation(async ({ fetchUrl, outputPath }) => {
      await fs.emptyDir(outputPath);
      await fs.outputFile(
        join(outputPath, 'README.md'),
        `from ${fetchUrl} for \${{ values.name }} owned by \${{ values.owner }}`,
      );
    });

    action = createFetchTemplatePlusAction({
      reader: Symbol('UrlReader') as unknown as UrlReaderService,
      integrations: Symbol('Integrations') as unknown as ScmIntegrations,
    });
  });

  it(`returns a TemplateAction with the id 'fetch:template:plus'`, () => {
    expect(action.id).toEqual('fetch:template:plus');
  });

  it('templates every entry into its own target path', async () => {
    const ctx = mockContext({
      commonParams: { values: { name: 'test-project', owner: 'team-a' } },
      templates: [
        { url: './skeleton/main', targetPath: './target-main' },
        { url: './skeleton/docs', targetPath: './target-docs' },
      ],
    });

    await action.handler(ctx);

    expect(fetchContentsMock).toHaveBeenCalledTimes(2);
    await expect(
      fs.readFile(join(workspacePath, 'target-main/README.md'), 'utf-8'),
    ).resolves.toEqual('from ./skeleton/main for test-project owned by team-a');
    await expect(
      fs.readFile(join(workspacePath, 'target-docs/README.md'), 'utf-8'),
    ).resolves.toEqual('from ./skeleton/docs for test-project owned by team-a');
  });

  it('merges values with entry values taking precedence', async () => {
    const ctx = mockContext({
      commonParams: { values: { name: 'test-project', owner: 'team-a' } },
      templates: [
        {
          url: './skeleton/docs',
          targetPath: './target-docs',
          values: { owner: 'team-docs' },
        },
      ],
    });

    await action.handler(ctx);

    await expect(
      fs.readFile(join(workspacePath, 'target-docs/README.md'), 'utf-8'),
    ).resolves.toEqual(
      'from ./skeleton/docs for test-project owned by team-docs',
    );
  });

  it('lets an entry targetPath override a commonParams targetPath', async () => {
    const ctx = mockContext({
      commonParams: {
        targetPath: './common-target',
        values: { name: 'test-project', owner: 'team-a' },
      },
      templates: [
        { url: './skeleton/main' },
        { url: './skeleton/docs', targetPath: './target-docs' },
      ],
    });

    await action.handler(ctx);

    await expect(
      fs.pathExists(join(workspacePath, 'common-target/README.md')),
    ).resolves.toBe(true);
    await expect(
      fs.pathExists(join(workspacePath, 'target-docs/README.md')),
    ).resolves.toBe(true);
  });

  it('trims whitespace from a templated targetPath', async () => {
    const ctx = mockContext({
      commonParams: { values: { name: 'test-project', owner: 'team-a' } },
      templates: [
        { url: './skeleton/main', targetPath: '\n  ./target-main\n' },
      ],
    });

    await action.handler(ctx);

    await expect(
      fs.pathExists(join(workspacePath, 'target-main/README.md')),
    ).resolves.toBe(true);
  });

  it('skips an entry when skipIf is set', async () => {
    const ctx = mockContext({
      commonParams: { values: { name: 'test-project', owner: 'team-a' } },
      templates: [
        { url: './skeleton/main', targetPath: './target-main' },
        { url: './skeleton/ci', targetPath: './target-ci', skipIf: true },
      ],
    });

    await action.handler(ctx);

    expect(fetchContentsMock).toHaveBeenCalledTimes(1);
    await expect(fs.pathExists(join(workspacePath, 'target-ci'))).resolves.toBe(
      false,
    );
    expect(ctx.output).toHaveBeenCalledWith('results', [
      {
        url: './skeleton/main',
        targetPath: './target-main',
        status: 'completed',
      },
      { url: './skeleton/ci', targetPath: './target-ci', status: 'skipped' },
    ]);
  });

  it('continues past a failing entry when ignoreErrors is set', async () => {
    fetchContentsMock.mockImplementationOnce(async () => {
      throw new Error('boom');
    });

    const ctx = mockContext({
      commonParams: { values: { name: 'test-project', owner: 'team-a' } },
      templates: [
        {
          url: './skeleton/optional',
          targetPath: './target-optional',
          ignoreErrors: true,
        },
        { url: './skeleton/main', targetPath: './target-main' },
      ],
    });

    await action.handler(ctx);

    await expect(
      fs.pathExists(join(workspacePath, 'target-main/README.md')),
    ).resolves.toBe(true);
    expect(ctx.output).toHaveBeenCalledWith('results', [
      {
        url: './skeleton/optional',
        targetPath: './target-optional',
        status: 'failed',
        error: 'boom',
      },
      {
        url: './skeleton/main',
        targetPath: './target-main',
        status: 'completed',
      },
    ]);
  });

  it('fails the step when an entry fails without ignoreErrors', async () => {
    fetchContentsMock.mockImplementationOnce(async () => {
      throw new Error('boom');
    });

    const ctx = mockContext({
      commonParams: { values: { name: 'test-project', owner: 'team-a' } },
      templates: [
        { url: './skeleton/main', targetPath: './target-main' },
        { url: './skeleton/docs', targetPath: './target-docs' },
      ],
    });

    await expect(action.handler(ctx)).rejects.toThrow('boom');
    expect(fetchContentsMock).toHaveBeenCalledTimes(1);
    expect(ctx.output).not.toHaveBeenCalled();
  });

  it('throws when an entry has no url', async () => {
    const ctx = mockContext({
      commonParams: { values: { name: 'test-project' } },
      templates: [{ targetPath: './target-main' }],
    });

    await expect(action.handler(ctx)).rejects.toThrow(
      'templates[0] is missing a url',
    );
  });

  it('inherits a url from commonParams', async () => {
    const ctx = mockContext({
      commonParams: {
        url: './skeleton/main',
        values: { name: 'test-project', owner: 'team-a' },
      },
      templates: [{ targetPath: './target-main' }],
    });

    await action.handler(ctx);

    await expect(
      fs.readFile(join(workspacePath, 'target-main/README.md'), 'utf-8'),
    ).resolves.toEqual('from ./skeleton/main for test-project owned by team-a');
  });

  it('passes the template baseUrl and token through to the fetch', async () => {
    const ctx = mockContext({
      commonParams: { values: { name: 'test-project', owner: 'team-a' } },
      templates: [
        { url: './skeleton/main', targetPath: './target-main', token: 'tok' },
      ],
    });

    await action.handler(ctx);

    expect(fetchContentsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: 'https://github.com/org/repo/blob/main/template.yaml',
        fetchUrl: './skeleton/main',
        token: 'tok',
      }),
    );
  });
});
