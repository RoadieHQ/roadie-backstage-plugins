import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { launchdarklyPlugin, LaunchdarklyPage } from '../src/plugin';

createDevApp()
  .registerPlugin(launchdarklyPlugin)
  .addPage({
    element: <LaunchdarklyPage />,
    title: 'Root Page',
    path: '/launchdarkly',
  })
  .render();
