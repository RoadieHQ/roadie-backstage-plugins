export interface AWSAccountProviderConfig {
  /**
   * Account ID for this Account
   */
  accountId: string;
  /**
   * Role to assume for this account ID
   */
  roleArn: string;
}

export interface Config {
  catalog?: {
    /**
     * List of processor-specific options and attributes
     */
    providers?: {
      /**
       * AWS configuration
       */
      aws?: {
        /**
         * The accounts for this provider
         */
        accounts?: AWSAccountProviderConfig[];
      };
    };
  };
}
