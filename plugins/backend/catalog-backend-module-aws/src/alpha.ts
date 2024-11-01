/*
 * Copyright 2024 Larder Software Limited
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
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import {
  AWSLambdaFunctionProvider,
  AWSS3BucketProvider,
  AWSIAMUserProvider,
  AWSDynamoDbTableProvider,
  // AWSDynamoDbTableDataProvider,
  AWSIAMRoleProvider,
  AWSEKSClusterProvider,
  AWSEC2Provider,
  AWSRDSProvider,
  AWSOrganizationAccountsProvider,
} from './providers';
import { AWSIAMRoleProcessor } from './processors';

export default createBackendModule({
  pluginId: 'catalog',
  moduleId: 'aws-entity-provider',
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
        catalog: catalogProcessingExtensionPoint,
        discovery: coreServices.discovery,
      },
      async init({ config, logger, scheduler, catalog, discovery }) {
        if (
          config.getOptional(
            'catalog.processors.awsOrganization.provider.accountId',
          )
        ) {
          catalog.addEntityProvider(
            AWSOrganizationAccountsProvider.fromConfig(
              config.get('catalog.processors.awsOrganization.provider'),
              { logger, scheduler },
            ),
          );
        }

        for (const awsConfig of config.getOptionalConfigArray('aws.accounts') ||
          []) {
          // Amazon DynamoDB table data
          // await catalog.addEntityProvider(
          //   AWSDynamoDbTableDataProvider.fromConfig(awsConfig, {
          //     logger,
          //     scheduler,
          //   }),
          // );

          // Amazon DynamoDB table
          await catalog.addEntityProvider(
            AWSDynamoDbTableProvider.fromConfig(awsConfig, {
              logger,
              scheduler,
            }),
          );

          // Amazon EKS
          await catalog.addEntityProvider(
            AWSEKSClusterProvider.fromConfig(awsConfig, { logger, scheduler }),
          );

          // Amazon EC2
          await catalog.addEntityProvider(
            AWSEC2Provider.fromConfig(awsConfig, { logger, scheduler }),
          );

          // AWS Identity and Access Management role
          await catalog.addEntityProvider(
            AWSIAMRoleProvider.fromConfig(awsConfig, { logger, scheduler }),
          );

          // AWS Identity and Access Management user
          await catalog.addEntityProvider(
            AWSIAMUserProvider.fromConfig(awsConfig, { logger, scheduler }),
          );

          // AWS Lambda function
          await catalog.addEntityProvider(
            AWSLambdaFunctionProvider.fromConfig(awsConfig, {
              logger,
              scheduler,
            }),
          );

          // Amazon Relational Database Service (RDS)
          await catalog.addEntityProvider(
            AWSRDSProvider.fromConfig(awsConfig, { logger, scheduler }),
          );

          // Amazon Simple Storage Service (S3)
          await catalog.addEntityProvider(
            AWSS3BucketProvider.fromConfig(awsConfig, { logger, scheduler }),
          );

          await catalog.addProcessor(
            AWSIAMRoleProcessor.fromConfig(awsConfig, { logger, discovery }),
          );
        }

        logger.info('AWS entity providers registered');
      },
    });
  },
});
