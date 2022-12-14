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

export const mockFileResponse = {
  name: 'README.md',
  path: 'README.md',
  sha: 'e05c1eb16edde11b8c936a3130d157f9f29b907b',
  size: 4000,
  url: 'https://api.github.com/repos/mcalus3/backstage/contents/README.md?ref=master',
  html_url: 'https://github.com/mcalus3/backstage/blob/master/README.md',
  git_url:
    'https://api.github.com/repos/mcalus3/backstage/git/blobs/e05c1eb16edde11b8c936a3130d157f9f29b907b',
  download_url:
    'https://raw.githubusercontent.com/mcalus3/backstage/master/README.md',
  type: 'file',
  content: Buffer.from('⭐️', 'utf8').toString('base64'),
  encoding: 'base64',
  _links: {
    self: 'https://api.github.com/repos/mcalus3/backstage/contents/README.md?ref=master',
    git: 'https://api.github.com/repos/mcalus3/backstage/git/blobs/e05c1eb16edde11b8c936a3130d157f9f29b907b',
    html: 'https://github.com/mcalus3/backstage/blob/master/README.md',
  },
};

export const mockCommentsFileResponse = {
  name: 'README.md',
  path: 'README.md',
  sha: 'e05c1eb16edde11b8c936a3130d157f9f29b907b',
  size: 4000,
  url: 'https://api.github.com/repos/mcalus3/backstage/contents/README.md?ref=master',
  html_url: 'https://github.com/mcalus3/backstage/blob/master/README.md',
  git_url:
    'https://api.github.com/repos/mcalus3/backstage/git/blobs/e05c1eb16edde11b8c936a3130d157f9f29b907b',
  download_url:
    'https://raw.githubusercontent.com/mcalus3/backstage/master/README.md',
  type: 'file',
  content: Buffer.from('<!--- blah blah --->\nabc test️', 'utf8').toString(
    'base64',
  ),
  encoding: 'base64',
  _links: {
    self: 'https://api.github.com/repos/mcalus3/backstage/contents/README.md?ref=master',
    git: 'https://api.github.com/repos/mcalus3/backstage/git/blobs/e05c1eb16edde11b8c936a3130d157f9f29b907b',
    html: 'https://github.com/mcalus3/backstage/blob/master/README.md',
  },
};

export const mockRelativeImage = {
  name: 'README.md',
  path: 'README.md',
  sha: 'e05c1eb16edde11b8c936a3130d157f9f29b907b',
  size: 4000,
  url: 'https://api.github.com/repos/mcalus3/backstage/contents/README.md?ref=master',
  html_url: 'https://github.com/mcalus3/backstage/blob/master/README.md',
  git_url:
    'https://api.github.com/repos/mcalus3/backstage/git/blobs/e05c1eb16edde11b8c936a3130d157f9f29b907b',
  download_url:
    'https://raw.githubusercontent.com/mcalus3/backstage/master/README.md',
  type: 'file',
  content: Buffer.from('[a link](image.svg)', 'utf8').toString('base64'),
  encoding: 'base64',
  _links: {
    self: 'https://api.github.com/repos/mcalus3/backstage/contents/README.md?ref=master',
    git: 'https://api.github.com/repos/mcalus3/backstage/git/blobs/e05c1eb16edde11b8c936a3130d157f9f29b907b',
    html: 'https://github.com/mcalus3/backstage/blob/master/README.md',
  },
};

export const mockResponseFromBranch = {
  name: 'README.md',
  path: 'README.md',
  sha: 'e05c1eb16edde11b8c936a3130d157f9f29b907b',
  size: 4000,
  url: 'https://api.github.com/repos/mcalus3/backstage/contents/README.md?ref=master',
  html_url: 'https://github.com/mcalus3/backstage/blob/master/README.md',
  git_url:
    'https://api.github.com/repos/mcalus3/backstage/git/blobs/e05c1eb16edde11b8c936a3130d157f9f29b907b',
  download_url:
    'https://raw.githubusercontent.com/mcalus3/backstage/master/README.md',
  type: 'file',
  content: Buffer.from(
    '# Awesome test markdown file :thumbs-up:',
    'utf8',
  ).toString('base64'),
  encoding: 'base64',
  _links: {
    self: 'https://api.github.com/repos/mcalus3/backstage/contents/README.md?ref=master',
    git: 'https://api.github.com/repos/mcalus3/backstage/git/blobs/e05c1eb16edde11b8c936a3130d157f9f29b907b',
    html: 'https://github.com/mcalus3/backstage/blob/master/README.md',
  },
};
