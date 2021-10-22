import { createDevApp } from '@backstage/dev-utils';
import { datadogPlugin } from '../src/plugin';

createDevApp().registerPlugin(datadogPlugin).render();
