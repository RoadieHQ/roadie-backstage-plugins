import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import {
  scaffolderFrontendModuleHttpRequestFieldPlugin,
  ScaffolderFrontendModuleHttpRequestFieldPage,
} from '../src/plugin';

createDevApp()
  .registerPlugin(scaffolderFrontendModuleHttpRequestFieldPlugin)
  .addPage({
    element: <ScaffolderFrontendModuleHttpRequestFieldPage />,
    title: 'Root Page',
    path: '/scaffolder-frontend-module-http-request-field',
  })
  .render();
