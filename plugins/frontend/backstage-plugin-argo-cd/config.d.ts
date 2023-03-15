export interface Config {
  /** Optional configurations for the ArgoCD plugin */
  argocd?: {
    /**
     * The base url of the ArgoCD instance.
     * @visibility frontend
     */
    baseUrl?: string;
    /**
     * Enable versions view
     * @visibility frontend
     */
    versions?: {
      /**
       * Enable versions view
       * @visibility frontend
       */
      enabled?: boolean;
    };
    appLocatorMethods?: Array</**
     * @visibility secret
     */
    {
      /**
       * The base url of the ArgoCD instance.
       * @visibility frontend
       */
      type: string;
    }>;
  };
}
