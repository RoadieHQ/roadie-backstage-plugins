import {
  processingResult,
  CatalogProcessor,
  CatalogProcessorEmit,
  LocationSpec,
} from '@backstage/plugin-catalog-backend';
import { Config } from '@backstage/config';
import { Logger } from 'winston';
import { processUsers, UserObject } from '../bamboo';
import axios from 'axios';

/**
 * The configuration parameters for a single BambooHR provider.
 */
type ProviderConfig = {
  apiKey: string;
  domain: string;
};

type BambooDirectoryResp = {
  fields: {
    [key: string]: any;
  };
  employees: UserObject[];
};

export function readConfig(config: Config, logger: Logger): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  const providerConfigs =
    config.getOptionalConfigArray('integrations.bambooHr.providers') ??
    [];

  for (const providerConfig of providerConfigs) {
    try {
      const apiKey = providerConfig.getString('apiKey').split('\\n').join('\n');
      const domain = providerConfig.getString('domain');

      providers.push({ apiKey, domain });
    } catch (e) {
      logger.info(`Failed to configure bamboohr-org provider: ${e}`);
    }
  }
  return providers;
}

export class BambooHROrgProcessor implements CatalogProcessor {
  private readonly logger: Logger;
  private readonly providers: ProviderConfig[];

  static fromConfig(config: Config, options: { logger: Logger }) {
    const providers: ProviderConfig[] = readConfig(config, options.logger);

    return new BambooHROrgProcessor({
      ...options,
      providers,
    });
  }

  constructor(options: { logger: Logger; providers: ProviderConfig[] }) {
    this.logger = options.logger;
    this.providers = options.providers;
  }

  async readLocation(
    location: LocationSpec,
    _optional: boolean,
    emit: CatalogProcessorEmit,
  ): Promise<boolean> {
    const { target, type } = location;
    if (type !== 'bamboohr-org') {
      return false;
    }

    const provider = this.providers.filter(p => p.domain === target)[0];

    if (!provider) {
      emit(
        processingResult.generalError(
          location,
          `Target ${target} not configured for the bamboohr processor`,
        ),
      );
      return false;
    }

    try {
      this.logger.info(`Reading BambooHR Location.. ${target}`);
      const resp: BambooDirectoryResp = (
        await axios.get(
          `https://${provider.apiKey}:x@api.bamboohr.com/api/gateway.php/${target}/v1/employees/directory`,
          { headers: { Accept: 'application/json' } },
        )
      ).data;
      const entityUsers = processUsers(resp.employees);
      entityUsers.forEach(user => {
        // @ts-ignore
        emit(processingResult.entity(location, user));
      });
    } catch (error: any) {
      emit(processingResult.generalError(location, error.message));
      return true;
    }

    return true;
  }

  getProcessorName(): string {
    return 'BambooHROrgProcessor';
  }
}
