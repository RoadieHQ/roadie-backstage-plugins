/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ANNOTATION_LOCATION,
  ANNOTATION_VIEW_URL,
  ANNOTATION_ORIGIN_LOCATION,
  RELATION_OWNED_BY,
  UserEntity,
  DEFAULT_NAMESPACE,
} from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-backend';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { IAM } from '@aws-sdk/client-iam';
import { STS } from '@aws-sdk/client-sts';
import * as winston from "winston";
import {Config} from "@backstage/config";
import {AccountConfig} from "../types";
import { parseEntityRef } from '@backstage/catalog-model';

const link2aws = require('link2aws');

/**
 * Provides entities from AWS IAM User service.
 */
export class AWSIAMUserProvider implements EntityProvider {
  private readonly accountId: string;
  private readonly roleArn: string;
  private readonly externalId?: string;
  private readonly region: string;

  private connection?: EntityProviderConnection;
  private logger: winston.Logger;

  static fromConfig(config: Config, options: { logger: winston.Logger }) {
    const accountId = config.getString('accountId');
    const roleArn = config.getString('roleArn');
    const externalId = config.getOptionalString('externalId');
    const region = config.getString('region');

    return new AWSIAMUserProvider({ accountId, roleArn, externalId, region }, options)
  }

  constructor(account: AccountConfig, options: { logger: winston.Logger }) {
    this.accountId = account.accountId;
    this.roleArn = account.roleArn;
    this.externalId = account.externalId;
    this.region = account.region;
    this.logger = options.logger;
  }

  getProviderName(): string {
    return `aws-iam-user-${this.accountId}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(`Providing iam user resources from aws: ${this.accountId}`)
    const userResources: UserEntity[] = [];

    const credentials = fromTemporaryCredentials({
      params: { RoleArn: this.roleArn, ExternalId: this.externalId },
    });

    const creds = await credentials(); 
    const iam = new IAM({ credentials: creds, region: this.region });
    const sts = new STS({ credentials: creds });

    const account = await sts.getCallerIdentity({});

    const defaultAnnotations: { [name: string]: string } = {
      [ANNOTATION_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
      [ANNOTATION_ORIGIN_LOCATION]: `${this.getProviderName()}:${this.roleArn}`,
    };

    if (account.Account) {
      defaultAnnotations['amazon.com/account-id'] = account.Account;
    }

    const users = await iam.listUsers({});

    for (const user of users.Users || []) {
      if (user.UserName && user.Arn && user.UserId) {
        const { Tags } = await iam.listUserTags({UserName: user.UserName});
        const consoleLink = new link2aws.ARN(user.Arn).consoleLink;
        const owned_by = Tags?.find((t) => {
          if(t.Key === 'backstage.io/owned-by'){
            return true
          }
          return false;
        });
        const userEntity: UserEntity = {
          kind: 'User',
          apiVersion: "backstage.io/v1alpha1",
          metadata: {
            annotations: {
              ...defaultAnnotations,
              "amazon.com/iam-user-arn": user.Arn,
              [ANNOTATION_VIEW_URL]: consoleLink.toString(),
            },
            namespace: DEFAULT_NAMESPACE,
            name: user.UserId,
          },
          spec: {
            profile: {
              displayName: user.Arn,
              email: user.UserName,
            },
            memberOf: [],
          },
        }

        try {
          if(owned_by && owned_by.Value){
            this.logger.info(owned_by.Value);
            const target = parseEntityRef(owned_by.Value);
            //@ts-ignore
            userEntity.relations = [{
              type: 'user',
              targetRef: owned_by.Value,
              target: {
                kind: target.kind,
                namespace: target.namespace,
                name: target.name
              }
            }];
          }
        } catch(e){
          this.logger.info(`could not parse entity ref from tag ${owned_by?.Value}`)
        }

        console.log(JSON.stringify(userEntity));

        userResources.push(userEntity);
      }
    }

    await this.connection.applyMutation({
      type: 'full',
      entities: userResources.map(entity => {
        this.logger.debug(`Adding user ${entity.metadata.name} with location aws-iam-user-provider:${this.accountId}`)
        return {
          entity,
          locationKey: `aws-iam-user-provider:${this.accountId}`,
        }
      })
    });
  }
}
