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

import { createDevApp } from '@backstage/dev-utils';
import {
  iframePlugin,
  EntityIFrameCard,
  EntityIFrameContent,
  HomePageIFrameCard,
} from '../src';
import {
  IFrameContentProps,
  IFrameComponentProps,
  IFrameProps,
} from '../src/components/types';
import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'roadie.io/example_domain': 'com',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
  },
};

const props: IFrameProps = {
  src: 'https://example.com',
  height: '400px',
  width: '400px',
  title: 'Well hello there',
};

const componentProps: IFrameComponentProps = {
  templatedSrc: 'https://example.{{ roadie.io/example_domain }}/',
  title: 'Another amazing iframe',
};

const pageProps: IFrameContentProps = {
  iframe: props,
  title: 'Some amazing iframe',
};

createDevApp()
  .registerPlugin(iframePlugin)
  .addPage({
    element: <EntityIFrameCard {...props} />,
    title: 'Root Page',
    path: '/backstage-plugin-iframe',
  })
  .addPage({
    element: <EntityIFrameContent {...pageProps} />,
    title: 'Iframe page',
    path: 'iframe-page',
  })
  .addPage({
    element: (
      <EntityProvider entity={mockEntity}>
        <EntityIFrameCard {...componentProps} />
      </EntityProvider>
    ),
    title: 'Templated Iframe',
    path: 'iframe-page-templated',
  })
  .addPage({
    element: <HomePageIFrameCard {...{ ...props, title: '1234' }} />,
    title: 'Home Page',
    path: '/home',
  })
  .render();
