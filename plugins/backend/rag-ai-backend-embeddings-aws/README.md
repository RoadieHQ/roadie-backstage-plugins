<div align="center">
  <img src="https://images.ctfassets.net/hcqpbvoqhwhm/5J0FSNghLU8M6nZNtQHS0D/96bf022e075a5e10a5b3ba6b35ae8990/roadie-horiz-big-transp-back.png" alt="Roadie Logo" width="400"/>
</div>

> ⚠️ **Reference Implementation Only**  
> The rag-ai plugin and its modules are a reference implementation provided for demonstration and educational purposes.  
> We provide minimal support for these components and do not actively maintain or update them.

---

# RAG AI Backend-embeddings AWS Bedrock submodule

This is a submodule for the `@roadiehq/rag-ai-backend` module, which provides functionality to use AWS Bedrock embeddings to generate a RAG AI Backend plugin for Backstage. It integrates `@backstage/integration-aws-node` package for fetching AWS account credentials.

## Initialization

```typescript
const vectorStore = await createRoadiePgVectorStore({ logger, database });
const awsCredentialsManager = DefaultAwsCredentialsManager.fromConfig(config);
const credProvider = await awsCredentialsManager.getCredentialProvider();

const augmentationIndexer = await initializeBedrockEmbeddings({
  logger,
  catalogApi,
  vectorStore,
  discovery,
  config,
  options: {
    credentials: credProvider.sdkCredentialProvider,
    region: 'eu-central-1',
  },
});
```

## Configuration Options

The module expects 2 pieces of configuration:

1. The configuration of the module to configure AWS Bedrock
2. AWS integration configuration for credentials provisioning

### AWS Bedrock configuration

The module expects the name of the embeddings generative AI model to be configured via app-config. Optionally, you can also provide the maximum number of retries for the AWS SDK client.

```yaml
ai:
  embeddings:
    bedrock:
      # Name of the Bedrock model to use to create Embeddings
      modelName: 'amazon.titan-embed-text-v1'
      # Maximum number of retries for the AWS SDK client
      maxRetries: 3
      # Maximum number of concurrent requests for the AWS SDK client
      maxConcurrency: 100
```

### AWS Credentials Configuration

The module depends on the `@backstage/integration-aws-node` package which helps fetch AWS account credentials for AWS SDK clients in backend packages and plugins. Users configure AWS account information and the credentials in their Backstage app configurations. This could include IAM user credentials, IAM roles, and profile names for their AWS accounts.

A full description of how to use and configure `@backstage/integration-aws-node` package can be found from the [package README](https://github.com/backstage/backstage/blob/master/packages/integration-aws-node/README.md).

Configuration examples:

```yaml
aws:
  mainAccount:
    accessKeyId: ${MY_ACCESS_KEY_ID}
    secretAccessKey: ${MY_SECRET_ACCESS_KEY}
  accounts:
    - accountId: '111111111111'
      roleName: 'my-iam-role-name'
      externalId: 'my-external-id'
    - accountId: '222222222222'
      partition: 'aws-other'
      roleName: 'my-iam-role-name'
      region: 'not-us-east-1'
      accessKeyId: ${MY_ACCESS_KEY_ID_FOR_ANOTHER_PARTITION}
      secretAccessKey: ${MY_SECRET_ACCESS_KEY_FOR_ANOTHER_PARTITION}
    - accountId: '333333333333'
      accessKeyId: ${MY_OTHER_ACCESS_KEY_ID}
      secretAccessKey: ${MY_OTHER_SECRET_ACCESS_KEY}
    - accountId: '444444444444'
      profile: my-profile-name
    - accountId: '555555555555'
  accountDefaults:
    roleName: 'my-backstage-role'
    externalId: 'my-id'
```

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).
