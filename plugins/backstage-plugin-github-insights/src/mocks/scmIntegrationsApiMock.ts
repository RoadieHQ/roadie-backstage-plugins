import { ScmIntegrationsApi } from '@backstage/integration-react';
import { ConfigReader } from '@backstage/core-app-api';

export const defaultIntegrationsConfig = {
  integrations: {
    github: [
      {
        host: 'fake',
        apiBaseUrl: 'https://fake',
        token: 'fake',
      },
      {
        host: 'github.com',
        apiBaseUrl: 'https://api.github.com',
        token: 'asdf',
      },
    ],
  },
};

export const createScmIntegrationsApiMock = (
  config: object,
): ScmIntegrationsApi => {
  return ScmIntegrationsApi.fromConfig(
    ConfigReader.fromConfigs([
      {
        context: 'unit-test',
        data: config,
      },
    ]),
  );
};
