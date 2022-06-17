import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-backend';
import winston from 'winston';
import { AccountConfig } from '../types';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { STS } from '@aws-sdk/client-sts';
import {
  ANNOTATION_ORIGIN_LOCATION,
  ANNOTATION_LOCATION,
} from '@backstage/catalog-model';

export abstract class AWSEntityProvider implements EntityProvider {
  protected readonly accountId: string;
  protected readonly roleArn: string;
  private readonly externalId?: string;
  protected readonly region: string;
  protected readonly logger: winston.Logger;
  protected connection?: EntityProviderConnection;

  public abstract getProviderName(): string;

  protected constructor(
    account: AccountConfig,
    options: { logger: winston.Logger },
  ) {
    this.accountId = account.accountId;
    this.roleArn = account.roleArn;
    this.externalId = account.externalId;
    this.region = account.region;
    this.logger = options.logger;
  }

  protected getCredentials() {
    return fromTemporaryCredentials({
      params: { RoleArn: this.roleArn, ExternalId: this.externalId },
    });
  }

  public async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  protected async buildDefaultAnnotations() {
    const sts = new STS({ credentials: this.getCredentials() });

    const account = await sts.getCallerIdentity({});

    const defaultAnnotations: { [name: string]: string } = {
      [ANNOTATION_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
      [ANNOTATION_ORIGIN_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
    };

    if (account.Account) {
      defaultAnnotations['amazon.com/account-id'] = account.Account;
    }

    return defaultAnnotations;
  }
}
