import { createDevApp } from '@backstage/dev-utils';
import { travisciPlugin } from '../src';

createDevApp().registerPlugin(travisciPlugin).render();
