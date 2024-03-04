export {
  argocdPlugin as plugin,
  argocdPlugin,
  EntityArgoCDContent,
  EntityArgoCDOverviewCard,
  EntityArgoCDHistoryCard,
} from './plugin';
export * from './api';
export { isArgocdAvailable } from './conditions';
export {
  ARGOCD_ANNOTATION_APP_NAME,
  ARGOCD_ANNOTATION_APP_SELECTOR,
  ARGOCD_ANNOTATION_APP_NAMESPACE,
  ARGOCD_ANNOTATION_PROJECT_NAME,
  ARGOCD_ANNOTATION_PROXY_URL,
} from './components/useArgoCDAppData';
