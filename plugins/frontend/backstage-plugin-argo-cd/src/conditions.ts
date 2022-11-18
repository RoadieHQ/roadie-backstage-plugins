import { Entity } from '@backstage/catalog-model';
import {
  ARGOCD_ANNOTATION_APP_NAME,
  ARGOCD_ANNOTATION_APP_SELECTOR,
  ARGOCD_ANNOTATION_PROJECT_NAME,
} from './components/useArgoCDAppData';

export const isArgocdAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[ARGOCD_ANNOTATION_APP_NAME]) ||
  Boolean(entity?.metadata.annotations?.[ARGOCD_ANNOTATION_APP_SELECTOR]) ||
  Boolean(entity?.metadata.annotations?.[ARGOCD_ANNOTATION_PROJECT_NAME]);
