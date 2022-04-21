export interface Config {
  /** Optional configurations for the ArgoCD plugin */
  integrations?: {
    /**
     * The base url of the ArgoCD instance.
     * @visibility frontend
     */
    bamboohr?: {
      apikey: string;
      domain: string;
    };
    /**
     * The base url of the ArgoCD instance.
     * @visibility frontend
     */
  };
}
