export interface Config {
  /** Optional configurations for the ArgoCD plugin */
  argocd?: {
    /**
     * The base url of the ArgoCD instance.
     * @visibility frontend
     */
    baseUrl?: string;
    /**
     * Support for the ArgoCD beta feature "Applications in any namespace"
     * @visibility frontend
     */
    namespacedApps?: boolean;
    /**
     * The number of revisions to load per application in the history table.
     * @visibility frontend
     */
    revisionsToLoad?: number;
    /**
     * The base url of the ArgoCD instance.
     * @visibility frontend
     */
    appLocatorMethods?: Array</**
     * @visibility secret
     */
    {
      /**
       * The base url of the ArgoCD instance.
       * @visibility frontend
       */
      type: string;
      instances: Array<{
        /**
         * @visibility frontend
         */
        name: string;
        /**
         * @visibility frontend
         */
        frontendUrl?: string;
        /**
         * @visibility frontend
         */
        url: string;
      }>;
    }>;
  };
}
