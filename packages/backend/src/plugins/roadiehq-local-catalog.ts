/*
 * Copyright 2025 Larder Software Limited
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
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-catalog-backend-module-scaffolder-entity-model';
import {
  AWSLambdaFunctionProvider,
  AWSS3BucketProvider,
  AWSIAMUserProvider,
  AWSDynamoDbTableProvider,
  AWSDynamoDbTableDataProvider,
  AWSIAMRoleProvider,
  AWSIAMRoleProcessor,
  AWSEKSClusterProvider,
  AWSEC2Provider,
  AWSRDSProvider,
  AWSOrganizationAccountsProvider,
  AWSSNSTopicProvider,
  AWSSQSEntityProvider,
  AWSOpenSearchEntityProvider,
  AWSElastiCacheEntityProvider,
  AWSECRRepositoryEntityProvider,
  AWSVPCProvider,
  AWSSubnetProvider,
  AWSSecurityGroupProvider,
  AWSEBSVolumeProvider,
  AWSLoadBalancerProvider,
} from '@roadiehq/catalog-backend-module-aws';
import { OktaOrgEntityProvider } from '@roadiehq/catalog-backend-module-okta';
import { Duration } from 'luxon';
import { GravatarProcessor } from '@roadiehq/catalog-backend-module-gravatar';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  catalogProcessingExtensionPoint,
  catalogModelExtensionPoint,
  catalogAnalysisExtensionPoint,
} from '@backstage/plugin-catalog-node/alpha';
import { EntityProvider } from '@backstage/plugin-catalog-node';
import { Config } from '@backstage/config';

type RunnableProvider = EntityProvider & {
  run: () => Promise<void>;
};

export default createBackendModule({
  pluginId: 'catalog',
  moduleId: 'roadie-local-catalog',
  register(reg) {
    reg.registerInit({
      deps: {
        database: coreServices.database,
        cache: coreServices.cache,
        builder: catalogProcessingExtensionPoint,
        analyzers: catalogAnalysisExtensionPoint,
        catalogModel: catalogModelExtensionPoint,
        scheduler: coreServices.scheduler,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        discovery: coreServices.discovery,
        httpAuth: coreServices.httpAuth,
        http: coreServices.httpRouter,
        rootLifecycle: coreServices.rootLifecycle,
        auth: coreServices.auth,
        permissions: coreServices.permissions,
        userInfo: coreServices.userInfo,
        reader: coreServices.urlReader,
        pluginName: coreServices.pluginMetadata,
      },
      async init(env) {
        const providers: RunnableProvider[] = [];
        env.builder.addProcessor(
          AWSIAMRoleProcessor.fromConfig(env.config, env),
        );

        if (env.config.has('catalog.providers.okta')) {
          const orgConfigs = env.config.getConfigArray(
            'catalog.providers.okta',
          );
          for (const orgConfig of orgConfigs) {
            const orgProvider = OktaOrgEntityProvider.fromConfig(orgConfig, {
              ...env,
              groupNamingStrategy: 'kebab-case-name',
              userNamingStrategy: 'strip-domain-email',
            });
            env.builder.addEntityProvider(orgProvider);
            providers.push(orgProvider);
          }
        }

        for (const config of env.config.getOptionalConfigArray(
          'aws.accounts',
        ) || []) {
          const addProvider = (
            ProviderClass: {
              fromConfig: (
                config: Config,
                env: any,
                ...args: any[]
              ) => RunnableProvider;
            },
            ...args: any[]
          ): RunnableProvider => {
            const provider = ProviderClass.fromConfig(config, env, ...args);
            env.builder.addEntityProvider(provider);
            providers.push(provider);
            return provider;
          };

          const awsProviders = [
            AWSS3BucketProvider,
            AWSLambdaFunctionProvider,
            AWSIAMUserProvider,
            AWSSNSTopicProvider,
            AWSIAMRoleProvider,
            AWSDynamoDbTableProvider,
            AWSEKSClusterProvider,
            AWSEC2Provider,
            AWSRDSProvider,
            AWSSQSEntityProvider,
            AWSOpenSearchEntityProvider,
            AWSElastiCacheEntityProvider,
            AWSOrganizationAccountsProvider,
            AWSECRRepositoryEntityProvider,
            AWSVPCProvider,
            AWSSubnetProvider,
            AWSSecurityGroupProvider,
            AWSEBSVolumeProvider,
            AWSLoadBalancerProvider,
          ];

          awsProviders.forEach(ProviderClass => addProvider(ProviderClass));

          const useDdbData = config.has('dynamodbTableData');
          if (useDdbData) {
            addProvider(AWSDynamoDbTableDataProvider);
          }
        }

        env.builder.addProcessor(new GravatarProcessor());
        env.builder.addProcessor(new ScaffolderEntitiesProcessor());

        for (const [i, provider] of providers.entries()) {
          env.logger.info(`configuring ${provider.getProviderName()} schedule`);
          await env.scheduler.scheduleTask({
            id: `run_${provider.getProviderName()}_${i}`,
            fn: async () => {
              await provider.run();
            },
            frequency: Duration.fromObject({ minutes: 5 }),
            timeout: Duration.fromObject({ minutes: 10 }),
          });
        }
      },
    });
  },
});
