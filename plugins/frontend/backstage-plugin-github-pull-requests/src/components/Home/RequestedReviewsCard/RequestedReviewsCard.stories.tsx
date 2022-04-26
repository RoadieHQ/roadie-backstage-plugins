// import { InfoCard } from '@backstage/core-components';
import { wrapInTestApp, TestApiProvider } from '@backstage/test-utils';
import { Grid } from '@material-ui/core';
import React, { ComponentType } from 'react';
import { HomePageRequestedReviewsCard } from '../../../plugin';

import { AnyApiRef, githubAuthApiRef } from '@backstage/core-plugin-api';
import { setupRequestMockHandlers } from '@backstage/test-utils';
import { render, screen, cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { Content } from './Content';
import { handlers } from '../../../mocks/handlers';

import {
  SignedInMockGithubAuthState,
  SignedOutMockGithubAuthState,
} from '../../../mocks/githubAuthApi';

const apis: [AnyApiRef, Partial<unknown>][] = [
  [githubAuthApiRef, SignedInMockGithubAuthState],
];

export default {
  title: 'Plugins/Home/Components/RequestedReviewsCard',
  decorators: [
    (Story: ComponentType<{}>) =>
      wrapInTestApp(
        <TestApiProvider apis={apis}>
          <Story />
        </TestApiProvider>,
      ),
  ],
};

export const Default = () => {
  return (
    <Grid item xs={12} md={6}>
      <HomePageRequestedReviewsCard />
    </Grid>
  );
};
