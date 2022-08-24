#!/usr/bin/env node

/* eslint-disable import/no-extraneous-dependencies */
/*
 * Copyright 2020 The Backstage Authors
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

const { Octokit } = require('@octokit/rest');

const [TAG_NAME, BOOL_CREATE_RELEASE] = process.argv.slice(2);

if (!BOOL_CREATE_RELEASE) {
  console.log(
    '\nRunning script in Dry Run mode. It will output details, will create a draft release but will NOT publish it.',
  );
}

const GH_OWNER = 'RoadieHQ';
const GH_REPO = 'roadie-backstage-plugins';
const EXPECTED_COMMIT_MESSAGE = /^Merge pull request #(?<prNumber>[0-9]+) from/;
const CHANGESET_RELEASE_BRANCH =
  'roadie-backstage-plugins/changeset-release/main';

// Initialize a GitHub client
const { GITHUB_TOKEN } = process.env;
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// Get the message of the commit responsible for a tag
async function getCommitMessageUsingTagName(tagName) {
  // Get the tag SHA using the provided tag name
  const refData = await octokit.git.getRef({
    owner: GH_OWNER,
    repo: GH_REPO,
    ref: `tags/${tagName}`,
  });
  if (refData.status !== 200) {
    console.error('refData:');
    console.error(refData);
    throw new Error(
      'Something went wrong when getting the tag SHA using tag name',
    );
  }
  const tagSha = refData.data.object.sha;
  console.log(`SHA for the tag ${TAG_NAME} is ${tagSha}`);

  // Get the commit SHA using the tag SHA
  const tagData = await octokit.git.getTag({
    owner: GH_OWNER,
    repo: GH_REPO,
    tag_sha: tagSha,
  });
  if (tagData.status !== 200) {
    console.error('tagData:');
    console.error(tagData);
    throw new Error(
      'Something went wrong when getting the commit SHA using tag SHA',
    );
  }
  const commitSha = tagData.data.object.sha;

  // Get the commit message using the commit SHA
  const commitData = await octokit.git.getCommit({
    owner: GH_OWNER,
    repo: GH_REPO,
    commit_sha: commitSha,
  });
  if (commitData.status !== 200) {
    console.error('commitData:');
    console.error(commitData);
    throw new Error(
      'Something went wrong when getting the commit message using commit SHA',
    );
  }

  return commitData.data.message;
}

// There is a PR number in our expected commit message. Get the description of that PR.
async function getReleaseDescriptionFromCommitMessage(commitMessage) {
  // It should exactly match the pattern of changeset commit message, or else will abort.
  const expectedMessage = RegExp(EXPECTED_COMMIT_MESSAGE);
  if (!expectedMessage.test(commitMessage)) {
    throw new Error(
      `Expected regex did not match commit message: ${commitMessage}`,
    );
  }

  // Get the PR description from the commit message
  const prNumber = commitMessage.match(expectedMessage).groups.prNumber;
  const { data } = await octokit.pulls.get({
    owner: GH_OWNER,
    repo: GH_REPO,
    pull_number: prNumber,
  });

  // Use the PR description to prepare for the release description
  const isChangesetRelease = commitMessage.includes(CHANGESET_RELEASE_BRANCH);
  if (isChangesetRelease) {
    return data.body.split('\n').slice(3).join('\n');
  }

  return data.body;
}

// Create Release on GitHub.
async function createRelease(releaseDescription) {
  // Create draft release if BOOL_CREATE_RELEASE is undefined
  // Publish release if BOOL_CREATE_RELEASE is not undefined
  const boolCreateDraft = !BOOL_CREATE_RELEASE;

  const releaseResponse = await octokit.repos.createRelease({
    owner: GH_OWNER,
    repo: GH_REPO,
    tag_name: TAG_NAME,
    name: TAG_NAME,
    body: releaseDescription,
    draft: boolCreateDraft,
    prerelease: false,
  });

  if (releaseResponse.status === 201) {
    if (boolCreateDraft) {
      console.log('Created draft release! Click Publish to notify users.');
    } else {
      console.log('Published release!');
    }
    console.log(releaseResponse.data.html_url);
  } else {
    console.error(releaseResponse);
    throw new Error('Something went wrong when creating the release.');
  }
}

async function main() {
  const commitMessage = await getCommitMessageUsingTagName(TAG_NAME);
  const releaseDescription = await getReleaseDescriptionFromCommitMessage(
    commitMessage,
  );

  await createRelease(releaseDescription);
}

main().catch(error => {
  console.error(error.stack);
  process.exit(1);
});
