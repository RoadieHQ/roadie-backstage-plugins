import { createBackend } from '@backstage/backend-defaults';
import { argocdServiceFactory } from '../src/factories/argocdService.factory';

const backend = createBackend();
backend.add(argocdServiceFactory);
backend.add(import('../src/alpha'));
backend.start();
