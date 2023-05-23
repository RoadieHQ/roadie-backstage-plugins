export interface Config {
  /** Optional configurations for the ArgoCD plugin */
  argocd?: {
    /**
     * @visibility secret
     */
    username?: string;
    /**
     * @visibility secret
     */
    password?: string;
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
        /**
         * @visibility secret
         */
        token?: string;
        /**
         * @visibility secret
         */
        username?: string;
        /**
         * @visibility secret
         */
        password?: string;
      }>;
    }>;
  };
}
