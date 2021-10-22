import { createDevApp } from '@backstage/dev-utils';
import { buildkitePlugin } from '../src';

createDevApp().registerPlugin(buildkitePlugin).render();
