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
} from '@backstage/plugin-catalog-node';
import { EntityProvider } from '@backstage/plugin-catalog-node';

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
          const s3Provider = AWSS3BucketProvider.fromConfig(config, env);
          const lambdaProvider = AWSLambdaFunctionProvider.fromConfig(
            config,
            env,
          );
          const iamUserProvider = AWSIAMUserProvider.fromConfig(config, env);
          const snsTopicProvider = AWSSNSTopicProvider.fromConfig(config, env);
          const iamRoleProvider = AWSIAMRoleProvider.fromConfig(config, env);
          const ddbTableProvider = AWSDynamoDbTableProvider.fromConfig(
            config,
            env,
          );
          const eksClusterProvider = AWSEKSClusterProvider.fromConfig(
            config,
            env,
          );
          const ec2Provider = AWSEC2Provider.fromConfig(config, env);
          const rdsProvider = AWSRDSProvider.fromConfig(config, env);
          const sqsProvider = AWSSQSEntityProvider.fromConfig(config, env);
          const openSearchProvider = AWSOpenSearchEntityProvider.fromConfig(
            config,
            env,
          );
          const redisProvider = AWSElastiCacheEntityProvider.fromConfig(
            config,
            env,
          );
          const awsAccountsProvider =
            AWSOrganizationAccountsProvider.fromConfig(config, env);
          const ecrRepositoryProvider =
            AWSECRRepositoryEntityProvider.fromConfig(config, env);

          const vpcProvider = AWSVPCProvider.fromConfig(config, env);
          const subnetProvider = AWSSubnetProvider.fromConfig(config, env);
          const securityGroupProvider = AWSSecurityGroupProvider.fromConfig(
            config,
            env,
          );
          const ebsVolProvider = AWSEBSVolumeProvider.fromConfig(config, env);
          const loadBalancerProvider = AWSLoadBalancerProvider.fromConfig(
            config,
            env,
          );

          env.builder.addEntityProvider(s3Provider);
          env.builder.addEntityProvider(lambdaProvider);
          env.builder.addEntityProvider(iamUserProvider);
          env.builder.addEntityProvider(snsTopicProvider);
          env.builder.addEntityProvider(iamRoleProvider);
          env.builder.addEntityProvider(ddbTableProvider);
          env.builder.addEntityProvider(eksClusterProvider);
          env.builder.addEntityProvider(ec2Provider);
          env.builder.addEntityProvider(rdsProvider);
          env.builder.addEntityProvider(sqsProvider);
          env.builder.addEntityProvider(openSearchProvider);
          env.builder.addEntityProvider(redisProvider);
          env.builder.addEntityProvider(awsAccountsProvider);
          env.builder.addEntityProvider(ecrRepositoryProvider);
          env.builder.addEntityProvider(vpcProvider);
          env.builder.addEntityProvider(subnetProvider);
          env.builder.addEntityProvider(securityGroupProvider);
          env.builder.addEntityProvider(ebsVolProvider);
          env.builder.addEntityProvider(loadBalancerProvider);
          providers.push(s3Provider);
          providers.push(lambdaProvider);
          providers.push(iamUserProvider);
          providers.push(iamRoleProvider);
          providers.push(snsTopicProvider);
          providers.push(ddbTableProvider);
          providers.push(eksClusterProvider);
          providers.push(ec2Provider);
          providers.push(rdsProvider);
          providers.push(sqsProvider);
          providers.push(openSearchProvider);
          providers.push(redisProvider);
          providers.push(awsAccountsProvider);
          providers.push(ecrRepositoryProvider);
          providers.push(vpcProvider);
          providers.push(subnetProvider);
          providers.push(securityGroupProvider);
          providers.push(ebsVolProvider);
          providers.push(loadBalancerProvider);

          const useDdbData = config.has('dynamodbTableData');
          if (useDdbData) {
            const ddbTableDataProvider =
              AWSDynamoDbTableDataProvider.fromConfig(config, env);
            env.builder.addEntityProvider(ddbTableDataProvider);
            providers.push(ddbTableDataProvider);
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
