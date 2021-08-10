import { createDevApp } from '@backstage/dev-utils';
import { argocdPlugin } from '../src/plugin';

createDevApp().registerPlugin(argocdPlugin).render();
