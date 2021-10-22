export interface Config {
  /** Optional configurations for the ArgoCD plugin */
  argocd?: {
    /**
     * The base url of the ArgoCD instance.
     * @visibility frontend
     */
    baseUrl?: string;
  };
}
