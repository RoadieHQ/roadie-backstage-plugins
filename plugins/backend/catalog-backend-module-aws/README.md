# Catalog Backend Module for AWS

This is an extension module to the plugin-catalog-backend plugin, providing
entity providers to read AWS objects as Backstage Entities.

## Usage

### "New" Backstage Backend

You will need to configure the providers in your catalog.ts file in your backstage backend:

```typescript
import {
  AWSEC2Provider,
  AWSIAMUserProvider,
  AWSLambdaFunctionProvider,
  AWSS3BucketProvider,
} from '@roadiehq/catalog-backend-module-aws';

const AWSProviders = [
  AWSEC2Provider,
  AWSIAMUserProvider,
  AWSLambdaFunctionProvider,
  AWSS3BucketProvider,
];

export default createBackendModule({
  moduleId: 'catalog-aws',
  pluginId: 'catalog',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        rootConfig: coreServices.rootConfig,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
      },
      async init({ catalog, rootConfig, logger, scheduler }) {
        const config = rootConfig.getConfigArray('catalog.providers.aws');
        for (const accountConfig of config) {
          catalog.addEntityProvider(
            AWSEC2Provider.fromConfig(accountConfig, {
              logger,
              scheduler,
            }),
          );
          catalog.addEntityProvider(
            AWSIAMUserProvider.fromConfig(accountConfig, {
              logger,
              scheduler,
            }),
          );
          catalog.addEntityProvider(
            AWSLambdaFunctionProvider.fromConfig(accountConfig, {
              logger,
              scheduler,
            }),
          );
          catalog.addEntityProvider(
            AWSS3BucketProvider.fromConfig(accountConfig, {
              logger,
              scheduler,
            }),
          );
        }
      },
    });
  },
});
```

### Legacy Backstage Backend

If you are using the legacy backend, you can register the providers like this:

```typescript
import {
  AWSLambdaFunctionProvider,
  AWSS3BucketProvider,
  AWSIAMUserProvider,
  AWSEC2Provider,
} from '@roadiehq/catalog-backend-module-aws';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  const s3Provider = AWSS3BucketProvider.fromConfig(config, env);
  const lambdaProvider = AWSLambdaFunctionProvider.fromConfig(config, env);
  const iamUserProvider = AWSIAMUserProvider.fromConfig(config, env);
  const ec2Provider = AWSEC2Provider.fromConfig(config, env);
  const awsAccountsProvider = AWSOrganizationAccountsProvider.fromConfig(
    config,
    env,
  );

  builder.addEntityProvider(s3Provider);
  builder.addEntityProvider(lambdaProvider);
  builder.addEntityProvider(iamUserProvider);
  builder.addEntityProvider(ec2Provider);
  builder.addEntityProvider(awsAccountsProvider);

  s3Provider.run();
  lambdaProvider.run();
  iamUserProvider.run();
  ec2Provider.run();
  awsAccountsProvider.run();

  const { processingEngine, router } = await builder.build();
  await processingEngine.start();

  // ...

  return router;
}
```

## Templating

While this module includes default templates for AWS resources, you can customize them by providing your own templates. There are two ways to do this:

1. Provide a custom template string.
2. Extend the provider classes to create your own providers with custom templates.

### Custom Template String

If you simply want to change the structure of your entities and data, you can provide your own template string when creating the provider. For example, to create a custom Lambda Function provider with a different template.

Here is the example from one of the tests:

```typescript
import { AWSLambdaFunctionProvider } from '@roadiehq/catalog-backend-module-aws';

const customLambdaTemplate = `
kind: Resource
apiVersion: backstage.io/v1beta1
metadata:
  name: {{ data.FunctionArn | to_entity_name }}
  annotations:
    amazon.com/lambda-function-arn: {{ data.FunctionArn }}
    backstage.io/view-url: "https://{{ region }}.console.aws.amazon.com/lambda/home?region={{ region }}#/functions/{{ data.FunctionName }}"
  title: {{ data.FunctionName }}
`;
const lambdaProvider = AWSLambdaFunctionProvider.fromConfig(
  accountConfig,
  {
    logger,
    scheduler,
    template: customLambdaTemplate,
  },
);
catalog.addEntityProvider(lambdaProvider);
```

### Custom Template via SubClass

Sometimes you need a bit more flexibility than just changing the template string. For example, you may need to make some intensive changes to the data or even fetch some additional metadata asynchronously. In these cases, you can extend an existing provider, adding your own custom template and even Nunjucks filters. For example, here is an example `ExtendedAWSLambdaFunctionProvider` that adds a `spec.status.deployments` field to the generated entities, which you can then use to track deployment information for the Lambda function over time through a Processor.

Some things to note in this example:

1. In the template, we extend `AWSEntityProvider.base.yaml`. The contents of this template (and usage instructions) are visible [AWSEntityProvider.base.yaml.njk.ts](./src/providers/AWSEntityProvider.base.yaml.njk.ts). At the moment, this is the only template that can be extended, since it's through a memory-loader, but this may change in the future.
2. We add a custom Nunjucks filter `get_deployment_statuses` that extracts deployment information from the Lambda function resource and its tags. Using this custom filter, we have access to the full resource data, tags, and other contextual information like account ID and region.
3. Our custom filter is synchronous, so we can return the data. If you need to do something asynchronous (like fetch more data from AWS), you can make the filter async, but you will need to adjust your template to use the `async` Nunjucks tag. See the [Nunjucks documentation](https://mozilla.github.io/nunjucks/api.html#asynchronous-support) for more details about async filters (spoiler: you need to use a callback).

```typescript
import type { FunctionConfiguration } from '@aws-sdk/client-lambda';
import { AWSLambdaFunctionProvider } from '@roadiehq/catalog-backend-module-aws';
import type { Environment } from 'nunjucks';

interface DeploymentStatus {
  type: 'lambda-function';
  attributes: {
    'aws-account-id': string;
    'aws-region': string;
    'deployed-at': string;
    'deployed-by': string;
    environment: string;
    'revision-id': string;
    runtime: string;
    'package-type': string;
    version: string;
    [key: string]: string;
  };
}

interface DeploymentStatusOtherData {
  tags: Record<string, string>;
  mergedAnnotations: Record<string, string>;
  accountId: string;
  region: string;
}

const defaultTemplate = `
{% extends 'AWSEntityProvider.base.yaml' %}

{% set entityName = data.FunctionArn | arn_to_name %}
{% set entityTitle = data.FunctionName %}
{% set entityType = "lambda-function" %}

{% block additionalMetadata %}
  {{ data | debug(tags) }}
  description: "{{ data.Description }}"
  runtime: {{ data.Runtime }}
  memorySize: {{ data.MemorySize }}
  ephemeralStorage: {{ data.EphemeralStorage.Size }}
  timeout: {{ data.Timeout }}
  {% if data.Architectures | length > 0 %}
  architectures:
    {% for arch in data.Architectures %}
    - {{ arch }}
    {% endfor %}
  {% endif %}
{% endblock %}

{% block additionalSpec %}
  status:
    deployments:
      {% for deployment in data | get_deployment_statuses({ tags: tags, mergedAnnotations: mergedAnnotations, accountId: accountId, region: region }) %}
      - type: {{ deployment.type }}
        {% for key, value in deployment.attributes %}
        {{ key }}: {{ value }}
        {% endfor %}
      {% endfor %}
{% endblock %}
`;

export class ExtendedAWSLambdaFunctionProvider extends AWSLambdaFunctionProvider {
  protected override getDefaultTemplate(): string {
    return defaultTemplate
  }

  protected override addCustomFilters(env: Environment): void {
    if (super.addCustomFilters) {
      super.addCustomFilters(env);
    }

    env.addFilter('get_deployment_statuses', (resource: FunctionConfiguration, otherData: DeploymentStatusOtherData): DeploymentStatus[] => {
      const { tags, accountId, region } = otherData;
      return [
        {
          type: 'lambda-function',
          attributes: {
            'aws-account-id': accountId,
            'aws-region': region,
            'deployed-at': resource.LastModified || 'unknown',
            'deployed-by': tags.DeployedBy || 'unknown',
            environment: tags.AccountAlias || tags.Stage || tags.Environment || 'unknown',
            'revision-id': resource.RevisionId || 'unknown',
            runtime: resource.Runtime || 'unknown',
            'package-type': resource.PackageType || 'unknown',
            version: resource.Version || 'unknown',
          },
        },
      ];
    });
  }
}
```

### Debugging Template data

One of the difficulties of building your own template is just knowing what is in the data, tags, etc. One way you can dig a little deeper is to use the built-in [dump](https://mozilla.github.io/nunjucks/templating.html#dump) filter. This will `JSON.stringify` the objects right into the output value. This can be a little awkward, since creates invalid YAML output. This may still be what you want, but if you want to still render your entities property while separately logging your data, you can add a custom `debug` filter that writes the data to the console or to a file. Here's an example for our `ExtendedAWSLambdaFunctionProvider` above, which writes to a file:

In the `addCustomFilters` method, add the following:

```typescript
env.addFilter('debug', (resource: FunctionConfiguration, tags: Record<string, string>): '' => {
  const name = `${resource.FunctionName ?? 'unknown'}`;
  const filePath = `./debug/lambda-${name}.json`;
  writeFileSync(path.resolve(dirname, filePath), JSON.stringify({ resource, tags }, null, 2));
  return ''; // return empty string to avoid messing up YAML
});
```

And then in your template, you can add the following, to pass both the data resource and the tags to the filter:

```nunjucks
{{ data | debug(tags) }}
```

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).
