import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { awsFrontendPlugin, AwsFrontendPage } from '../src/plugin';

createDevApp()
  .registerPlugin(awsFrontendPlugin)
  .addPage({
    element: <AwsFrontendPage />,
    title: 'Root Page',
    path: '/aws-frontend'
  })
  .render();
