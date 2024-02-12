/*
 * Copyright 2023 Larder Software Limited
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
  CatalogBuilder,
  EntityProvider,
} from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
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
} from '@roadiehq/catalog-backend-module-aws';
import { OktaOrgEntityProvider } from '@roadiehq/catalog-backend-module-okta';
import { Duration } from 'luxon';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  type RunnableProvider = EntityProvider & {
    run: () => Promise<void>;
  };
  const builder = await CatalogBuilder.create(env);
  const providers: RunnableProvider[] = [];
  builder.addProcessor(AWSIAMRoleProcessor.fromConfig(env.config, env));

  const orgProvider = OktaOrgEntityProvider.fromConfig(env.config, {
    ...env,
    groupNamingStrategy: 'kebab-case-name',
    userNamingStrategy: 'strip-domain-email',
  });
  builder.addEntityProvider(orgProvider);
  providers.push(orgProvider);

  for (const config of env.config.getOptionalConfigArray('integrations.aws') ||
    []) {
    const s3Provider = AWSS3BucketProvider.fromConfig(config, env);
    const lambdaProvider = AWSLambdaFunctionProvider.fromConfig(config, env);
    const iamUserProvider = AWSIAMUserProvider.fromConfig(config, env);
    const iamRoleProvider = AWSIAMRoleProvider.fromConfig(config, env);
    const ddbTableProvider = AWSDynamoDbTableProvider.fromConfig(config, env);
    const eksClusterProvider = AWSEKSClusterProvider.fromConfig(config, env);
    const ec2Provider = AWSEC2Provider.fromConfig(config, env);
    const rdsProvider = AWSRDSProvider.fromConfig(config, env);

    builder.addEntityProvider(s3Provider);
    builder.addEntityProvider(lambdaProvider);
    builder.addEntityProvider(iamUserProvider);
    builder.addEntityProvider(iamRoleProvider);
    builder.addEntityProvider(ddbTableProvider);
    builder.addEntityProvider(eksClusterProvider);
    builder.addEntityProvider(ec2Provider);
    builder.addEntityProvider(rdsProvider);
    providers.push(s3Provider);
    providers.push(lambdaProvider);
    providers.push(iamUserProvider);
    providers.push(iamRoleProvider);
    providers.push(ddbTableProvider);
    providers.push(eksClusterProvider);
    providers.push(ec2Provider);
    providers.push(rdsProvider);

    const useDdbData = config.has('dynamodbTableData');
    if (useDdbData) {
      const ddbTableDataProvider = AWSDynamoDbTableDataProvider.fromConfig(
        config,
        env,
      );
      builder.addEntityProvider(ddbTableDataProvider);
      providers.push(ddbTableDataProvider);
    }
  }

  builder.addProcessor(new ScaffolderEntitiesProcessor());

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

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
  return router;
}
