export type FunctionData = {
  name: string;
  urlTrigger: string;
  status: string;
  runtime: string;
  availableMemoryMb: number;
  updateTime: string;
  region: string;
  project: string;
  envVariables: Record<string, string>;
  labels: Record<string, string>;
  fullName: string;
};

export type FunctionDataDTO = {
  name: string;
  httpsTrigger: {
    url: string;
  };
  status: string;
  entryPoint: string;
  timeout: string;
  availableMemoryMb: number;
  serviceAccountEmail: string;
  updateTime: string;
  versionId: string;
  labels: Record<string, string>;
  sourceUploadUrl: string;
  environmentVariables: Record<string, string>;
  runtime: string;
  ingressSettings: string;
  buildId: string;
};
