export interface Config {
  /** Optional configurations for the ArgoCD plugin */
  argocd?: {
    /**
     * The base url of the ArgoCD instance.
     * @visibility frontend
     */
    baseUrl?: string;
    /**
     * The base url of the ArgoCD instance.
     * @visibility frontend
     */
    perCluster?: {
      /**
       * The base url of the ArgoCD instance.
       * @visibility frontend
       */
      enabled?: boolean;
      /**
       * The base url of the ArgoCD instance.
       * @visibility frontend
       */
      pattern?: string;
    };
  };
}
