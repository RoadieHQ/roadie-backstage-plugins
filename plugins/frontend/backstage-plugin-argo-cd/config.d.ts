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
        url: string;
      }>;
    }>;
  };
}
