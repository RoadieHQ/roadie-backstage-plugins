export interface Config {
  /** Optional configurations for the AWS plugin */
  aws?: {
    /**
     * The base url of the AWS instance.
     * @visibility frontend
     */
    accounts?: [
      {
        accountId: string;
        roleArn?: string;
        defaultRegion?: string;
      },
    ];
  };
}
