import { CatalogProcessor } from '@backstage/plugin-catalog-backend';
import { CatalogApi } from '@backstage/catalog-client';
import { Logger } from 'winston';

export abstract class AWSCatalogProcessor implements CatalogProcessor {
  protected readonly catalogApi: CatalogApi;
  protected readonly logger: Logger;
  public abstract getProcessorName(): string;
  constructor({
    catalogApi,
    logger,
  }: {
    catalogApi: CatalogApi;
    logger: Logger;
  }) {
    this.catalogApi = catalogApi;
    this.logger = logger;
  }
}
